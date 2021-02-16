import DataGrid, {
  Column,
  FilterRow,
  IColumnProps,
  Pager,
  Paging,
  Sorting,
  Selection,
} from "devextreme-react/data-grid";
import DataSource from "devextreme/data/data_source";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
interface DataGridProps {
  dataSource?: any[];
  columns: IColumnProps[];
  pager?: boolean;
  selectedRowKeys?: any[]; // can be controlled
  pageIndex?: number; // can be controlled
  pageSize?: number; // can be controlled
  pagerSizeSelector?: boolean;
  allowedPageSizes?: number[];
  filtering?: boolean;
  select?: boolean;
  isSortingDisabled?: boolean;
  onSelectionChanged?: (params: {}) => void; // callback
  onPageChanged?: (page: number) => void; // callback
}

const ControlledDataGrid = forwardRef<DataGrid, DataGridProps>(
  (
    {
      dataSource,
      columns,
      pageSize = 50,
      pager,
      pageIndex,
      allowedPageSizes = [10, 20, 50],
      pagerSizeSelector = true,
      filtering,
      select,
      selectedRowKeys = [],
      isSortingDisabled = false,
      onSelectionChanged,
      onPageChanged,
    }: DataGridProps,
    ref
  ) => {
    const _ref = useRef<DataGrid>(null);
    useImperativeHandle<DataGrid, any>(ref, () => _ref.current);
    const [_dataGridInstance, setDataGridInstance] = useState<any>();
    const [_pageSize, setPageSize] = useState(pageSize);
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
      _dataGridInstance && _dataGridInstance.selectRows(selectedRowKeys, false);
    }, [_dataGridInstance, selectedRowKeys]);

    useEffect(() => {
      setPageIndex(pageIndex);
    }, [pageIndex]);

    const onOptionChanged = (e: any): void => {
      const { fullName, value } = e;
      if (fullName === "paging.pageSize") {
        setPageSize(value);
        setPageIndex(0);
        if (onPageChanged) onPageChanged(value);
      }
      if (fullName === "paging.pageIndex") {
        setPageIndex(value);
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
        onOptionChanged={onOptionChanged}
      >
        <FilterRow visible={filtering} />
        {columns.map(
          (
            {
              dataField,
              visible,
              caption,
              width,
              minWidth,
              alignment,
              cellRender,
              lookup,
            },
            index
          ) => (
            <Column
              key={index}
              caption={caption}
              visible={visible}
              dataField={dataField}
              width={width}
              minWidth={minWidth}
              alignment={alignment}
              cellRender={cellRender}
              lookup={lookup}
            />
          )
        )}
        <Paging pageSize={_pageSize} pageIndex={_pageIndex} />
        {pager && (
          <Pager
            visible={pager}
            showInfo={true}
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
      </DataGrid>
    );
  }
);

export default ControlledDataGrid;
