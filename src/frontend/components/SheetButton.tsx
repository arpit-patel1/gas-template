import type { SheetInfo } from '../../backend/serverFunctions'

// Adapted from enuchi/React-Google-Apps-Script (MIT).
type Props = {
  sheet: SheetInfo
  onDelete: (index: number) => void
  onActivate: (name: string) => void
}

const SheetButton = ({ sheet, onDelete, onActivate }: Props) => (
  <div
    className={`mt-5 inline-flex w-1/2 flex-wrap items-end justify-center space-x-2 border-b-2 p-2 py-3 font-medium leading-none tracking-wider ${
      sheet.isActive
        ? 'rounded-t border-indigo-500 bg-gray-100 text-indigo-500'
        : 'border-gray-200 hover:text-gray-900'
    }`}
  >
    <button
      className="grow bg-transparent focus:outline-none"
      onClick={() => onActivate(sheet.name)}
    >
      {sheet.name}
    </button>
    <button
      aria-label={`Delete ${sheet.name}`}
      className="bg-transparent hover:text-red-500"
      onClick={() => onDelete(sheet.index)}
    >
      &times;
    </button>
  </div>
)

export default SheetButton
