import { useState } from 'react'
import axios from '../utils/axios'

function ScheduleForm({ onSuccess }) {
  const [date, setDate] = useState('')
  const [room, setRoom] = useState("A")
  const [shift, setShift] = useState('sáng')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log({ date, room, shift, description })
    const token = localStorage.getItem('token')
    try {
      await axios.post('/schedule', {
        date,
        room,
        shift,
        description
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      alert('Thêm lịch thành công')
      onSuccess()
    } catch (err) {
      alert('Lỗi khi thêm lịch')
      console.error(err)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Ngày:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div>
        <label>Hội trường:</label>
        <select value={room} onChange={(e) => setRoom((e.target.value))}>
          {["A", "B", "C", "D", "E"].map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Buổi:</label>
        <select value={shift} onChange={(e) => setShift(e.target.value)}>
          <option value="sáng">Sáng</option>
          <option value="chiều">Chiều</option>
        </select>
      </div>
      <div>
        <label>Mô tả:</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <button type="submit">Thêm lịch</button>
    </form>
  )
}

export default ScheduleForm
