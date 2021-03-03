import DataGrid, {
  Column,
  FilterRow,
  IColumnProps,
  Pager,
  Paging,
  Selection,
  Sorting,
} from "devextreme-react/data-grid";
import DataSource from "devextreme/data/data_source";
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
  isSortingDisabled?: boolean;
  selectedRowKeys?: any[]; // can be controlled
  onSelectionChanged?: (params: {}) => void; // callback
  onPageChanged?: (page: number) => void; // callback
  onSortingChanged?: (index: number, order: "asc" | "desc") => void; // callback
  onFilteringChanged?: (index: number, value: string) => void;
}

const ControlledDataGrid = forwardRef<DataGrid, DataGridProps>(
  (
    {
      dataSource,
      columns,
      pageSize = 50,
      pager,
      pageIndex,
      allowedPageSizes = [],
      pagerSizeSelector = true,
      filtering,
      select,
      isSortingDisabled = false,
      sortBy,
      selectedRowKeys,
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
      _dataGridInstance &&
        _dataGridInstance.selectRows(selectedRowKeys || [], false);
    }, [_dataGridInstance, selectedRowKeys]);

    useEffect(() => {
      setPageIndex(pageIndex);
    }, [pageIndex]);

    const onOptionChanged = useCallback(
      () => (e: any): void => {
        const { fullName, value } = e;
        if (fullName === "paging.pageSize") {
          setPageSize(value);
          setPageIndex(0);
          if (onPageChanged) onPageChanged(value);
        }
        if (fullName === "paging.pageIndex") {
          setPageIndex(value);
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
        <FilterRow visible={filtering?.enable} showOperationChooser={false} />
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
        <Paging pageSize={_pageSize} pageIndex={_pageIndex} />
        {pager && (
          <Pager
            visible={pager}
            showInfo={true}
            infoText={"Page {0} of {1} ({2} items)"}
            allowedPageSizes={pager ? allowedPageSizes : "auto"}
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
