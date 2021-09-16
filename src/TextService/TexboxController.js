import React, { useState } from 'react'

function TexboxController() {

  const [confirm, setConfirm] = useState(false);

  return !confirm ? (
    <button
      style={{ zIndex: 1500 }}
      onClick={(e) => setConfirm(true)}
      onMouseDown={(e) => e.stopPropagation()}
    >
      Confirm</button>
  ) : <button>x</button>
}

export default TexboxController
