// confirmation box before delete
export default function DeleteConfirmModal({open, onClose, onConfirm, deleting, expense}) {
    if (!open || !expense) return null;

    return (
        <div className={"modal-overlay"} role={"dialog"} aria-modal={"true"}>
            <div className="modal-card">
                <div className={"modal-header"}>
                    <p className="modal-name">Delete Expense</p>
                </div>
                <div className="confirm-modal-body">
                    <p>
                        Are you sure you want to delete{" "}
                        <strong>"{expense.title}"</strong>?
                    </p>
                    <p className="confirm-warning">
                        This action cannot be undone.
                    </p>
                </div>
                <div className="modal-actions">
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={onClose}
                        disabled={deleting}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="delete-btn"
                        onClick={onConfirm}
                        disabled={deleting}
                    >
                        {deleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}