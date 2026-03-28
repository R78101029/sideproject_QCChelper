'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'

interface User {
  id: string
  username: string
  displayName: string
  role: string
  department: string | null
  isActive: boolean
  lastLoginAt: string | null
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    username: '',
    password: '',
    displayName: '',
    role: 'team_rep',
    department: '',
  })
  const [creating, setCreating] = useState(false)

  const loadUsers = () => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((res) => { if (res.success) setUsers(res.data) })
  }

  useEffect(() => { loadUsers() }, [])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast('success', '帳號建立成功')
        setShowCreate(false)
        setForm({ username: '', password: '', displayName: '', role: 'team_rep', department: '' })
        loadUsers()
      } else {
        toast('error', data.error || '建立失敗')
      }
    } finally {
      setCreating(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const roleLabels: Record<string, string> = {
    team_rep: '圈隊代表',
    qcc_admin: '品管圈管理員',
    sys_admin: '系統管理員',
  }

  return (
    <AppLayout displayName="管理員" onLogout={handleLogout}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">帳號管理</h1>
          <Button onClick={() => setShowCreate(true)}>建立帳號</Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-2 text-left text-gray-500">帳號</th>
                  <th className="px-3 py-2 text-left text-gray-500">姓名</th>
                  <th className="px-3 py-2 text-left text-gray-500">角色</th>
                  <th className="px-3 py-2 text-left text-gray-500">科別</th>
                  <th className="px-3 py-2 text-center text-gray-500">狀態</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="px-3 py-2 font-mono text-gray-700">{u.username}</td>
                    <td className="px-3 py-2 text-gray-700">{u.displayName}</td>
                    <td className="px-3 py-2 text-gray-700">{roleLabels[u.role] || u.role}</td>
                    <td className="px-3 py-2 text-gray-700">{u.department || '—'}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {u.isActive ? '啟用' : '停用'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="建立帳號">
          <div className="space-y-4">
            <Input label="帳號" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <Input label="密碼" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Input label="姓名" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            <Select
              label="角色"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={[
                { value: 'team_rep', label: '圈隊代表' },
                { value: 'qcc_admin', label: '品管圈管理員' },
                { value: 'sys_admin', label: '系統管理員' },
              ]}
            />
            <Input label="科別" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>取消</Button>
            <Button onClick={handleCreate} loading={creating}>建立</Button>
          </div>
        </Modal>
      </div>
    </AppLayout>
  )
}
