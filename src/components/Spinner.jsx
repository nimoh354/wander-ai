import React from 'react'

function Spinner() {
  return (
    <div style={{
      display: 'inline-block',
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #8B5CF6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
  )
}


export default Spinner