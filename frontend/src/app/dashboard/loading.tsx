import { Loader2 } from 'lucide-react'
import React from 'react'

const Loading = () => {
  return (
    <div className='flex items-center justify-center p-12'>
      <Loader2 className='text-muted-foreground animate-spin' />
      <span className='ml-3 text-lg'>Loading dashboard...</span>
    </div>
  )
}

export default Loading
