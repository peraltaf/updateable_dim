import { create } from 'zustand';


interface BaseRecord {
  id?: string
  Author: string
  'Review Date': Date | string
  Address: string
  Bank: string
  Rating: number
  'Review Title By User': string
  Review: string
  'Rating Title By User': string
  'Useful Count': number
  'Updated By'?: string
  'Update Date'?: Date | string
  isNew?: boolean
  isUpdated?: boolean
  guid: string
}


interface RecordType {
  rows: BaseRecord[]
  setRows: (newRows: BaseRecord[]) => void
}
const useRowsStore = create<RecordType>((set) => ({
  rows: [],
  setRows: (newRows:BaseRecord[]) => set(({ rows: newRows })),
}));


interface OGRecordType {
  ogRows: BaseRecord[]
  setOGRows: (newRows: BaseRecord[]) => void
}
const useOGRowsStore = create<OGRecordType>((set) => ({
  ogRows: [],
  setOGRows: (newRows:BaseRecord[]) => set(({ ogRows: newRows })),
}));


interface ColsBaseType {
  field: string
  headerName: string
  flex?: number
  editable?: boolean
  type: string
  getActions?: object
  width?: number
  cellClassName?: string,
  renderEditCell?: object
}
interface ColsType {
  columns: ColsBaseType[]
  setColumns: (newCols: ColsBaseType[]) => void
}
const useColumnsStore = create<ColsType>((set) => ({
  columns: [],
  setColumns: (newCols:ColsBaseType[]) => set(({ columns: newCols })),
}));


interface NewRecordsType {
  newRecords: BaseRecord[]
  setNewRecords: (newRows: BaseRecord[]) => void
}
const useNewRowsStore = create<NewRecordsType>((set) => ({
  newRecords: [],
  setNewRecords: (newRows:BaseRecord[]) => set(({ newRecords: newRows })),
}));


interface DeletedRecordsType {
  deletedRecords: BaseRecord[]
  setDeletedRecords: (rows: BaseRecord[]) => void
}
const useDeletedRowsStore = create<DeletedRecordsType>((set) => ({
  deletedRecords: [],
  setDeletedRecords: (rows:BaseRecord[]) => set(({ deletedRecords: rows })),
}));


interface DifferencesBaseType {
  new?: BaseRecord
  old?: BaseRecord
  changedKeys?: string[]
}
interface DifferencesType {
  changes: DifferencesBaseType[]
  setChanges: (records: DifferencesBaseType[]) => void
}
const useChangesStore = create<DifferencesType>((set) => ({
  changes: [],
  setChanges: (records:DifferencesBaseType[]) => set(({ changes: records })),
}));


interface SaveError {
  errorState: 'flex'|'none'
  errorMsg: string
}
interface SaveErrorType {
  saveError: SaveError
  setSaveError: (newError: SaveError) => void
}
const useSaveErrorStore = create<SaveErrorType>((set) => ({
  saveError: {
    errorState: 'none',
    errorMsg: ''
  },
  setSaveError: (newError:SaveError) => set(({ saveError: newError })),
}));


interface UpdateDate {
  update_date: string
  updated_by: string
}
interface UpdateDateType {
  updateDates: UpdateDate[],
  setUpdateDates: (newDates: UpdateDate[]) => void
}
const useUpdateDatesStore = create<UpdateDateType>((set) => ({
  updateDates: [],
  setUpdateDates: (newDates:UpdateDate[]) => set(({ updateDates: newDates })),
}));


interface LoggedInType {
  loggedIn: boolean
  username: string
}
interface LoggedIn {
  info: LoggedInType
  setLoggedIn: (info: LoggedInType) => void
}
const useLogin = create<LoggedIn>((set) => ({
  info: {
    loggedIn: false,
    username: ''
  },
  setLoggedIn: (newInfo:LoggedInType) => set(({ info: newInfo })),
}));


export {
  useChangesStore,
  useDeletedRowsStore,
  useRowsStore,
  useOGRowsStore,
  useColumnsStore,
  useNewRowsStore,
  useSaveErrorStore,
  useUpdateDatesStore,
  useLogin
}

export type { BaseRecord, ColsBaseType, DifferencesBaseType, RecordType, UpdateDate }
