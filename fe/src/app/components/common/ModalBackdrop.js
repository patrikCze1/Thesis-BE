import React from 'react'

export default function ModalBackdrop(props) {
    return (
        <div className="fade modal modal-backdrop show">
            { props.childern }
        </div>
    )
}
