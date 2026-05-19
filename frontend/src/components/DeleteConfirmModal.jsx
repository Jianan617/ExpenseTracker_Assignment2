export default function DeleteConfirmModal({   open,
                                               expense,
                                               title = "Delete Confirmation",
                                               itemLabel,
                                               message,
                                               warning = "This action cannot be undone.",
                                               confirmText = "Delete",
                                               cancelText = "Cancel",
                                               deleting = false,
                                               error = "",
                                               onClose,
                                               onConfirm,
                                           }) {
    //do not render modal when it is closed
    if (!open) return null;

    //seep compatibility with existing expense delete logic
    const displayLabel = itemLabel || expense?.title || "this item";

    //default message if custom message is not provided
    const displayMessage = message || `Are you sure you want to delete "${displayLabel}"?`;

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card">
                <div className="modal-header">
                    <p className="modal-name">{title}</p>
                </div>

                <div className="confirm-modal-body">
                    <p>{displayMessage}</p>
                    <p className="confirm-warning">{warning}</p>
                    {error && <div className="form-alert error-alert">{error}</div>}
                </div>

                <div className="modal-actions">
                    <button
                        className="cancel-btn"
                        type="button"
                        onClick={onClose}
                        disabled={deleting}
                    >
                        {cancelText}
                    </button>

                    <button
                        className="delete-btn"
                        type="button"
                        onClick={onConfirm}
                        disabled={deleting}
                    >
                        {deleting ? "Deleting..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}