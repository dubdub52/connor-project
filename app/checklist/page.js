'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Checklist() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('checklist')
      .select('*')
      .order('category')
    
    if (error) {
      console.log('error', error)
    } else {
      setTasks(data)
    }
    setLoading(false)
  }

  async function toggleTask(id, currentStatus) {
    const { error } = await supabase
      .from('checklist')
      .update({ is_completed: !currentStatus })
      .eq('id', id)
    
    if (!error) {
      setTasks(tasks.map(task => 
        task.id === id 
          ? { ...task, is_completed: !currentStatus }
          : task
      ))
    }
  }

  const completedCount = tasks.filter(t => t.is_completed).length
  const totalCount = tasks.length
  const progressPercent = totalCount > 0 
    ? Math.round((completedCount / totalCount) * 100) 
    : 0

  const categories = [...new Set(tasks.map(t => t.category))]

  if (loading) return <div style={{padding: '2rem'}}>Loading...</div>

  return (
    <div style={{maxWidth: '800px', margin: '0 auto', padding: '2rem'}}>
      <h1>Connor's Project Checklist</h1>
      
      <div style={{marginBottom: '2rem'}}>
        <p>{completedCount} of {totalCount} tasks completed — {progressPercent}%</p>
        <div style={{
          background: '#eee', 
          borderRadius: '8px', 
          height: '16px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#22c55e',
            height: '100%',
            width: `${progressPercent}%`,
            transition: 'width 0.3s ease'
          }}/>
        </div>
      </div>

      {categories.map(category => (
        <div key={category} style={{marginBottom: '2rem'}}>
          <h2 style={{borderBottom: '1px solid #eee', paddingBottom: '0.5rem'}}>
            {category}
          </h2>
          {tasks
            .filter(task => task.category === category)
            .map(task => (
              <div 
                key={task.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #f5f5f5'
                }}
              >
                <input
                  type='checkbox'
                  checked={task.is_completed}
                  onChange={() => toggleTask(task.id, task.is_completed)}
                  style={{width: '18px', height: '18px', cursor: 'pointer'}}
                />
                <span style={{
                  textDecoration: task.is_completed ? 'line-through' : 'none',
                  color: task.is_completed ? '#999' : '#000'
                }}>
                  {task.task}
                </span>
              </div>
            ))}
        </div>
      ))}
    </div>
  )
}