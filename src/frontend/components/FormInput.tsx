import { useState, type FormEvent } from 'react'

// Adapted from enuchi/React-Google-Apps-Script (MIT).
const FormInput = ({ onSubmit }: { onSubmit: (name: string) => void }) => {
  const [value, setValue] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    onSubmit(value.trim())
    setValue('')
  }

  return (
    <form className="flex w-full items-center" onSubmit={handleSubmit}>
      <div className="grow py-1 pr-2">
        <input
          className="w-full rounded border border-gray-300 bg-gray-100/50 py-1 text-base text-gray-700 outline-none transition-colors focus:border-indigo-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="New sheet name"
        />
      </div>
      <button
        className="rounded bg-indigo-500 px-8 py-2 text-white hover:bg-indigo-600 focus:outline-none"
        type="submit"
      >
        Add Sheet
      </button>
    </form>
  )
}

export default FormInput
