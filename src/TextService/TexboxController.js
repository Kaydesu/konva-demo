import React, { useState } from 'react'

function TexboxController({ id, onRemove, onConfirm }) {

  const [confirm, setConfirm] = useState(false);

  const handleOnConfirm = () => {
    onConfirm(id);
    setConfirm(true);
  }

  return !confirm ? (
    <button
      onClick={handleOnConfirm}
    >
      Confirm</button>
  ) : (<button
    onClick={() => onRemove(id)}

  >x</button>)
}

export default TexboxController
