import React from "react";

const PaymentValid = ({ paymentMethodLabel, onConfirm, onClose }) => (
	<div className="policy-popup">
		<h2>Confirm Payment Method</h2>
		<p>You have selected: <b>{paymentMethodLabel}</b></p>
		<div className="popup-btn-row">
			<button className="cta-button" onClick={onConfirm}>Confirm</button>
			<button className="policy-btn" onClick={onClose}>Cancel</button>
		</div>
	</div>
);

export default PaymentValid;
