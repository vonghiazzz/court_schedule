import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../utils/axios'
import ScheduleForm from '../components/ScheduleForm'

function Schedule() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSchedules = async () => {
    try {
      const res = await axios.get('/schedule')
      setSchedules(res.data)
    } catch (err) {
      console.error(err)
      alert('Không lấy được lịch')
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }

    axios.get('/me')
      .then(res => {
        setUser(res.data)
        fetchSchedules()
      })
      .catch(err => {
        console.error('Token hết hạn hoặc không hợp lệ:', err)
        localStorage.removeItem('token')
        navigate('/')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [navigate])

  if (loading) return <p>Đang tải...</p>

  return (
    <div style={{ padding: 20 }}>
      <h2>Lịch xét xử</h2>
      {user && <p>Xin chào, Thẩm phán {user.username}</p>}

      <h3>Thêm lịch mới</h3>
      <ScheduleForm onSuccess={fetchSchedules} />

      <h3>Danh sách lịch:</h3>
      <ul>
        {schedules.map(item => (
          <li key={item.id}>
            Ngày: {item.date} | Buổi: {item.shift} | Hội trường: {item.room} <br />
            Thẩm phán: {item.user.username} <br />
            {item.description && <>Ghi chú: {item.description}</>}
            <hr />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Schedule
