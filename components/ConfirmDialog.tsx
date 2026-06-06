"use client";
// components/ConfirmDialog.tsx
interface Props {
  onConfirm: () => void;
  onCancel:  () => void;
}

export default function ConfirmDialog({ onConfirm, onCancel }: Props) {
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <h3>Delete message?</h3>
        <p>This message will be permanently removed and cannot be recovered.</p>
        <div className="dialog-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
