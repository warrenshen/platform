import DataGrid, {
  Column,
  ColumnFixing,
  Export,
  FilterRow,
  IColumnProps,
  Pager,
  Paging,
  Selection,
  Sorting,
} from "devextreme-react/data-grid";
import DataSource from "devextreme/data/data_source";
import { exportDataGrid } from "devextreme/excel_exporter";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

interface DataGridProps {
  isSortingDisabled?: boolean;
  isExcelExport?: boolean;
  exportFileName?: string;
  exportFileType?: "csv" | "xlsx";
  dataSource?: any[];
  columns: IColumnProps[];
  pager?: boolean;
  pageIndex?: number; // can be controlled
  pageSize?: number; // can be controlled
  filtering?: {
    enable: boolean;
    filterBy?: { index: number; value: string | number };
  }; // can be controlled
  sortBy?: { index: number; order: "asc" | "desc" }; // can be controlled
  pagerSizeSelector?: boolean;
  allowedPageSizes?: number[];
  select?: boolean;
  singleSelect?: boolean;
  selectedRowKeys?: any[]; // can be controlled
  editing?: Record<any, any>;
  onSaved?: (e: any) => void;
  onInitNewRow?: (e: any) => void;
  onSelectionChanged?: (params: {}) => void; // callback
  onPageChanged?: (page: number) => void; // callback
  onSortingChanged?: (index: number, order: "asc" | "desc") => void; // callback
  onFilteringChanged?: (index: number, value: string) => void;
}

const ControlledDataGrid = forwardRef<DataGrid, DataGridProps>(
  (
    {
      isSortingDisabled = false,
      isExcelExport = true,
      exportFileName,
      exportFileType = "xlsx",
      dataSource,
      columns,
      pageSize = 10,
      pager,
      pageIndex = 0,
      allowedPageSizes = [],
      pagerSizeSelector = true,
      filtering,
      select,
      singleSelect,
      sortBy,
      selectedRowKeys,
      editing = {},
      onSaved,
      onInitNewRow,
      onSelectionChanged,
      onPageChanged,
      onSortingChanged,
      onFilteringChanged,
    }: DataGridProps,
    ref
  ) => {
    const _ref = useRef<DataGrid>(null);
    useImperativeHandle<DataGrid, any>(ref, () => _ref.current);
    const [_dataGridInstance, setDataGridInstance] = useState<any>();
    const [_pageIndex, setPageIndex] = useState(pageIndex);

    const _dataSource = useMemo<DataSource>(
      () =>
        new DataSource({
          store: {
            type: "array",
            data: dataSource,
            key: "id",
          },
        }),
      [dataSource]
    );

    useEffect(() => {
      _ref &&
        _ref.current &&
        _ref.current.instance &&
        setDataGridInstance(_ref.current.instance);
    }, [_ref]);

    useEffect(() => {
      _dataGridInstance &&
        _dataGridInstance.selectRows(selectedRowKeys || [], false);
    }, [_dataGridInstance, selectedRowKeys]);

    useEffect(() => {
      setPageIndex(pageIndex);
    }, [pageIndex]);

    const onOptionChanged = useCallback(
      () =>
        (e: any): void => {
          const { fullName, value } = e;
          if (fullName === "paging.pageIndex") {
            setPageIndex(value);
            if (onPageChanged) onPageChanged(value);
          }
          if (fullName.endsWith("sortOrder")) {
            const index = fullName.match("/(?<=[).+?(?=])/g")[0];
            if (onSortingChanged) onSortingChanged(index, value);
          }
          if (fullName.endsWith("filterValue")) {
            const index = fullName.match("/(?<=[).+?(?=])/g")[0];
            if (onFilteringChanged) onFilteringChanged(index, value);
          }
        },
      [onFilteringChanged, onPageChanged, onSortingChanged]
    );

    const onExporting = function (event: any) {
      if (exportFileType === "csv") {
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet("Main sheet");

        exportDataGrid({
          topLeftCell: { row: 1, column: 1 },
          component: event.component,
          worksheet: worksheet,
        }).then(function () {
          // https://github.com/exceljs/exceljs#writing-csv
          // https://github.com/exceljs/exceljs#reading-csv

          // Remove header (1st) row.
          worksheet.spliceRows(0, 1);
          workbook.csv.writeBuffer().then(function (buffer) {
            saveAs(
              new Blob([buffer], { type: "application/octet-stream" }),
              `${exportFileName || "Report"}.${exportFileType}`
            );
          });
        });

        event.cancel = true;
      }
    };

    // Note: it is ok that we use `index` as the key for the <Column>
    // element below because we do not support re-ordering columns or
    // other operations that require a stronger key than `index`.
    return (
      <DataGrid
        ref={_ref}
        height={"100%"}
        width={"100%"}
        dataSource={_dataSource}
        wordWrapEnabled={true}
        onSelectionChanged={onSelectionChanged}
        onExporting={onExporting}
        onOptionChanged={onOptionChanged}
        editing={editing}
        onSaved={onSaved}
        onInitNewRow={onInitNewRow}
      >
        <ColumnFixing enabled={true} />
        <Export enabled={isExcelExport} />
        <FilterRow visible={filtering?.enable} showOperationChooser={false} />
        {columns.map(
          (
            {
              fixed,
              visible,
              dataField,
              dataType,
              caption,
              width,
              minWidth,
              alignment,
              cellRender,
              lookup,
              calculateCellValue,
              calculateSortValue,
              calculateDisplayValue,
              defaultSortIndex,
              defaultSortOrder,
              format,
            },
            index
          ) => (
            <Column
              key={index}
              fixed={fixed}
              visible={visible}
              caption={caption}
              dataField={dataField}
              dataType={dataType}
              width={width}
              minWidth={minWidth}
              alignment={alignment}
              cellRender={cellRender}
              calculateCellValue={calculateCellValue}
              calculateSortValue={calculateSortValue}
              calculateDisplayValue={calculateDisplayValue}
              defaultSortIndex={defaultSortIndex}
              defaultSortOrder={defaultSortOrder}
              format={format}
              lookup={lookup}
              {...(sortBy &&
                Object.keys(sortBy).length > 0 &&
                sortBy?.index === index && { sortOrder: sortBy?.order })}
              {...(filtering?.enable &&
                filtering?.filterBy &&
                Object.keys(filtering?.filterBy).length > 0 &&
                filtering?.filterBy.index === index && {
                  filterValue: filtering?.filterBy.value,
                })}
            />
          )
        )}
        <Paging
          pageSize={pageSize}
          pageIndex={_pageIndex}
          onPageIndexChange={setPageIndex}
        />
        {pager && (
          <Pager
            visible={pager}
            showInfo={true}
            infoText={"Page {0} of {1} ({2} items)"}
            allowedPageSizes={allowedPageSizes}
            showPageSizeSelector={pagerSizeSelector}
          />
        )}
        <Sorting mode={isSortingDisabled ? "none" : "single"} />
        {select && (
          <Selection
            mode="multiple"
            selectAllMode={"allPages"}
            showCheckBoxesMode={"always"}
          />
        )}
        {singleSelect && <Selection mode="single" />}
      </DataGrid>
    );
  }
);

export default ControlledDataGrid;
