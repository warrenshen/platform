import json
import logging
import os
from datetime import datetime
from io import BytesIO
from typing import Any, Callable, Dict, List, Tuple, cast

import boto3
from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import FileTypeEnum
from bespoke.db.models import session_scope
from botocore.exceptions import ClientError
from flask import current_app, request
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common.auth_util import UserSession
from sqlalchemy.orm.session import Session

FileInfoDict = TypedDict('FileInfoDict', {
    'name': str,
    'content_type': str,
    'size': int
})

FileInDBDict = TypedDict('FileInDBDict', {
    'id': str,
    'path': str
})

def _save_file_to_db(
        session_maker: Callable, file_info: FileInfoDict, company_id: str,
        path: str, user_session: UserSession) -> FileInDBDict:
    _, ext = os.path.splitext(file_info['name'])
    with session_scope(session_maker) as session:
        file_orm = models.File(
            company_id=company_id,
            name=file_info['name'],
            path=path,
            extension=ext.lstrip('.'),
            size=file_info['size'],
            mime_type=file_info['content_type'],
            created_by_user_id=user_session.get_user_id()
        )
        session.add(file_orm)
        session.flush()
        return FileInDBDict(
            id=str(file_orm.id),
            path=file_orm.path
        )

def _check_file_permission(
    file_type: str, file_id: str, user_session: UserSession, session: Session) -> Tuple[bool, errors.Error]:

    company_id = user_session.get_company_id()

    def _eq_company_id(col_val: Any) -> bool:
        return str(col_val) == company_id

    if user_session.has_bank_reader_permission():
        return True, None

    file_in_db = cast(
        models.File,
        session.query(models.File).filter(
            models.File.id == file_id
        ).first())

    if file_in_db and _eq_company_id(file_in_db.company_id):
        # If the company matches on the 'files' table itself, then no
        # need to check on more file specific tables.
        return True, None

    if file_type == FileTypeEnum.COMPANY_AGREEMENT:
        company_agreement = cast(
            models.CompanyAgreement,
            session.query(models.CompanyAgreement).filter(
                models.CompanyAgreement.file_id == file_id
            ).first())
        if not company_agreement:
            return False, errors.Error('No company agreement found')

        if _eq_company_id(company_agreement.company_id):
            return True, None

    elif file_type == FileTypeEnum.COMPANY_LICENSE:
        company_license = cast(
            models.CompanyLicense,
            session.query(models.CompanyLicense).filter(
                models.CompanyLicense.file_id == file_id
            ).first())
        if not company_license:
            return False, errors.Error('No company license found')

        if _eq_company_id(company_license.company_id):
            return True, None

    elif file_type == FileTypeEnum.EBBA_APPLICATION:
        ebba_file = cast(
            models.EbbaApplicationFile,
            session.query(models.EbbaApplicationFile).filter(
                models.EbbaApplicationFile.file_id == file_id
            ).first())
        if not ebba_file:
            return False, errors.Error('No ebba application file found')

        ebba_application = cast(
            models.EbbaApplication,
            session.query(models.EbbaApplication).filter(
                models.EbbaApplication.id == ebba_file.ebba_application_id
            ).first())

        if not ebba_application:
            return False, errors.Error('No ebba application associated with this file')

        if _eq_company_id(ebba_application.company_id):
            return True, None

    elif file_type == FileTypeEnum.INVOICE:
        invoice_file = cast(
            models.InvoiceFile,
            session.query(models.InvoiceFile).filter(
                models.InvoiceFile.file_id == file_id
            ).first())
        if not invoice_file:
            return False, errors.Error('No invoice file found')

        invoice = cast(
            models.Invoice,
            session.query(models.Invoice).filter(
                models.Invoice.id == invoice_file.invoice_id
            ).first())

        if not invoice:
            return False, errors.Error('No invoice associated with this file')

        if _eq_company_id(invoice.company_id) or _eq_company_id(invoice.payor_id):
            return True, None

    elif file_type == FileTypeEnum.PURCHASE_ORDER:
        purchase_order_file = cast(
            models.PurchaseOrderFile,
            session.query(models.PurchaseOrderFile).filter(
                models.PurchaseOrderFile.file_id == file_id
            ).first())
        if not purchase_order_file:
            return False, errors.Error('No purchase order file found')

        purchase_order = cast(
            models.PurchaseOrder,
            session.query(models.PurchaseOrder).filter(
                models.PurchaseOrder.id == purchase_order_file.purchase_order_id
            ).first())

        if not purchase_order:
            return False, errors.Error('No purchase order associated with this file')

        if _eq_company_id(purchase_order.company_id) or _eq_company_id(purchase_order.vendor_id):
            return True, None

    return False, errors.Error('Access Denied')

def put_signed_url() -> Tuple[str, FileInDBDict, bool, errors.Error]:
    s3_client = boto3.client('s3')
    cfg = cast(Config, current_app.app_config)
    bucket_name = cfg.S3_BUCKET_NAME

    form = json.loads(request.data)
    if not form:
        return None, None, None, errors.Error('No form provided in get the signed url')

    required_keys = ['file_info', 'doc_type', 'company_id']
    for key in required_keys:
        if key not in form:
            return None, None, None, errors.Error(f'Missing {key} in signed url request')

    file_info = cast(FileInfoDict, form['file_info'])
    company_id = form['company_id']
    now_str = datetime.now().strftime('%Y%m%d-%H%M%S-%f')
    path = f"files/customers/{company_id}/{form['doc_type']}/{now_str}/{file_info['name']}"
    content_type = file_info['content_type']

    try:
        url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': bucket_name,
                'Key': path,
                'ContentType': content_type
            },
            ExpiresIn=600,
        )
    except ClientError as e:
        logging.error('Exception generating presigned_url: {}'.format(e))
        return None, None, None, errors.Error('Failed to create upload url')

    upload_via_server = False
    if cfg.is_development_env() or cfg.is_test_env():
        upload_via_server = True

    # Keep track of the file, we assume the upload to S3 will succeed.
    user_session = UserSession.from_session()
    file_in_db_dict = _save_file_to_db(
        current_app.session_maker, file_info, company_id, path, user_session)

    return url, file_in_db_dict, upload_via_server, None

def download_signed_url(is_anonymous: bool) -> Tuple[List[Dict[str,str]], errors.Error]:
    s3_client = boto3.client('s3')
    cfg = cast(Config, current_app.app_config)
    bucket_name = cfg.S3_BUCKET_NAME

    form = json.loads(request.data)
    if not form:
        return None, errors.Error('No form provided in download signed url request')

    user_session = UserSession.from_session()

    if 'file_ids' not in form:
        return None, errors.Error('file ids must be provided to download signed urls')

    file_ids = form['file_ids']

    with session_scope(current_app.session_maker) as session:
        if not is_anonymous:
            for file_id in file_ids:
                success, err = _check_file_permission(
                    form.get('file_type'), file_id, user_session, session)
                if err:
                    raise err

        file_orms = cast(
            List[models.File], session.query(models.File).filter(models.File.id.in_(file_ids)).all())
        if not file_orms:
            raise errors.Error(f'No files found for given file ids: {file_ids}')

        if len(file_orms) != len(file_ids):
            return None, errors.Error('Some file ids requested are not available in the database')

        file_id_to_file_orm = {}
        for file_orm in file_orms:
            file_id_to_file_orm[str(file_orm.id)] = file_orm

        # Create file objects (with signed URL) for response.
        files_data = []

        for i in range(len(file_ids)):
            try:
                file_id = file_ids[i]
                file_orm = file_id_to_file_orm[file_id]

                url = s3_client.generate_presigned_url(
                    'get_object',
                    Params={
                        'Bucket': bucket_name,
                        'Key': file_orm.path
                    },
                    ExpiresIn=300,
                )
                files_data.append({
                    'id': file_id,
                    'name': file_orm.name,
                    'path': file_orm.path,
                    'url': url,
                    'created_at': date_util.datetime_to_str(file_orm.created_at),
                })
            except ClientError as e:
                logging.error('Exception generating presigned_url: {}'.format(e))
                return None, errors.Error('Failed to create download url')

        return files_data, None

def upload_signed_url() -> Tuple[bool, errors.Error]:
    s3_client = boto3.client('s3')
    cfg = cast(Config, current_app.app_config)
    bucket_name = cfg.S3_BUCKET_NAME

    presigned_url = request.headers['X-Bespoke-Url']
    content_type = request.headers['X-Bespoke-Content-Type']
    s3_key_path = request.headers['X-Bespoke-FilePath']

    try:
        s3_client.upload_fileobj(
            BytesIO(request.files['file'].stream.read()), bucket_name, s3_key_path)
    except ClientError as e:
        logging.error('Exception generating presigned_url: {}'.format(e))
        return False, errors.Error('Failed to create download url')

    return True, None
