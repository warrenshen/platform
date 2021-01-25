import json
import logging
import os
from datetime import datetime
from io import BytesIO
from typing import Callable, List, cast

import boto3
import requests
from bespoke.db import models
from bespoke.db.models import session_scope
from botocore.exceptions import ClientError
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from flask_jwt_extended import get_jwt_identity, jwt_required
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common.auth_util import UserPayloadDict, UserSession

handler = Blueprint('files', __name__)

FileInfoDict = TypedDict('FileInfoDict', {
    'name': str,
    'content_type': str,
    'size': int
})

FileInDBDict = TypedDict('FileInDBDict', {
    'id': str,
    'path': str
})


def make_error_response(msg: str) -> Response:
    return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)


def _save_file_to_db(
        session_maker: Callable, file_info: FileInfoDict, company_id: str,
        path: str, cur_user: UserPayloadDict) -> FileInDBDict:
    _, ext = os.path.splitext(file_info['name'])
    with session_scope(session_maker) as session:
        file_orm = models.File(
            company_id=company_id,
            name=file_info['name'],
            path=path,
            extension=ext.lstrip('.'),
            size=file_info['size'],
            mime_type=file_info['content_type'],
            created_by_user_id=cur_user['X-Hasura-User-Id']
        )
        session.add(file_orm)
        session.flush()
        return FileInDBDict(
            id=str(file_orm.id),
            path=file_orm.path
        )


class PutSignedUrlView(MethodView):

    @jwt_required
    def post(self) -> Response:
        s3_client = boto3.client('s3')
        cfg = cast(Config, current_app.app_config)
        bucket_name = cfg.S3_BUCKET_NAME

        form = json.loads(request.data)
        if not form:
            return make_error_response('No form provided in get the signed url')

        required_keys = ['file_info', 'doc_type', 'company_id']
        for key in required_keys:
            if key not in form:
                return make_error_response(f'Missing {key} in signed url request')

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
            return make_error_response('Failed to create upload url')

        upload_via_server = False
        if cfg.is_development_env():
            upload_via_server = True

        # Keep track of the file, we assume the upload to S3 will succeed.
        cur_user = get_jwt_identity()
        file_in_db_dict = _save_file_to_db(
            current_app.session_maker, file_info, company_id, path, cur_user)

        return make_response(json.dumps({
            'status': 'OK',
            'url': url,
            'file_in_db': file_in_db_dict,
            'upload_via_server': upload_via_server
        }), 200)


class DownloadSignedUrlView(MethodView):

    @jwt_required
    def post(self) -> Response:
        s3_client = boto3.client('s3')
        cfg = cast(Config, current_app.app_config)
        bucket_name = cfg.S3_BUCKET_NAME

        form = json.loads(request.data)
        if not form:
            return make_error_response('No form provided in download signed url request')

        user_session = UserSession(get_jwt_identity())

        if 'file_ids' not in form:
            return make_error_response('file ids must be provided to download signed urls')

        file_ids = form['file_ids']

        with session_scope(current_app.session_maker) as session:
            file_orms = cast(
                List[models.File], session.query(models.File).filter(models.File.id.in_(file_ids)).all())
            if not file_orms:
                return make_error_response('No file ids found that match these file ids')

            if len(file_orms) != len(file_ids):
                return make_error_response('Some file ids requested are not available in the database')

            paths = [file_orm.path for file_orm in file_orms]

            urls = []
            for i in range(len(paths)):
                try:
                    path = paths[i]
                    url = s3_client.generate_presigned_url(
                        'get_object',
                        Params={
                            'Bucket': bucket_name,
                            'Key': path
                        },
                        ExpiresIn=300,
                    )
                    urls.append(url)
                except ClientError as e:
                    logging.error(
                        'Exception generating presigned_url: {}'.format(e))
                    return make_error_response('Failed to create download url')

            # Create file objects (with signed URL) for response.
            files_data = []
            for file_orm, file_url in zip(file_orms, urls):
                files_data.append({
                    'id': str(file_orm.id),
                    'name': file_orm.name,
                    'path': file_orm.path,
                    'url': url
                })

            return make_response(json.dumps({'status': 'OK', 'files': files_data, 'urls': urls}), 200)


class UploadSignedUrlView(MethodView):

    @ jwt_required
    def put(self) -> Response:
        s3_client = boto3.client('s3')
        cfg = cast(Config, current_app.app_config)
        bucket_name = cfg.S3_BUCKET_NAME

        presigned_url = request.headers['X-Bespoke-Url']
        content_type = request.headers['X-Bespoke-Content-Type']
        s3_key_path = request.headers['X-Bespoke-FilePath']

        s3_client.upload_fileobj(
            BytesIO(request.files['file'].stream.read()), bucket_name, s3_key_path)
        return make_response(json.dumps({'status': 'OK'}), 200)


handler.add_url_rule(
    '/download_signed_url', view_func=DownloadSignedUrlView.as_view(name='download_signed_url_view'))

handler.add_url_rule(
    '/put_signed_url', view_func=PutSignedUrlView.as_view(name='put_signed_url_view'))

handler.add_url_rule(
    '/upload_signed_url', view_func=UploadSignedUrlView.as_view(name='upload_signed_url_view'))
