import React from "react";

const PaymentType = ({ paymentDetails, setPaymentDetails, setAlertMessage, setAlertFlag }) => {
	return (
		<div className="payment-method">
			<div className="method-option">
				<label>
					<input
						type="radio"
						name="paymentMethod"
						value="cash"
						checked={paymentDetails.paymentMethod === "cash"}
						onChange={(e) =>
							setPaymentDetails({
								...paymentDetails,
								paymentMethod: e.target.value,
							})
						}
					/>
					<span className="method-title">Cash</span>
				</label>
				<button
					type="button"
					className="policy-btn"
					onClick={() => setAlertMessage(
						<div className="policy-popup">
							<h2>Cash Payment Policy</h2>
							<ul>
								<li>Pay directly to the bus driver before boarding.</li>
								<li>Reservation is held for 15 minutes before departure.</li>
								<li>No online refund for cash payments.</li>
							</ul>
							<button className="policy-btn" style={{width:'120px'}} onClick={() => setAlertFlag(false)}>Close</button>
						</div>
					) || setAlertFlag(true)}
				>
					View Policy
				</button>
			</div>
			<div className="method-option">
				<label>
					<input
						type="radio"
						name="paymentMethod"
						value="standalone"
						checked={paymentDetails.paymentMethod === "standalone"}
						onChange={(e) =>
							setPaymentDetails({
								...paymentDetails,
								paymentMethod: e.target.value,
							})
						}
					/>
					<span className="method-title">Standalone (Authorize Only)</span>
				</label>
				<button
					type="button"
					className="policy-btn"
					onClick={() => setAlertMessage(
						<div className="policy-popup">
							<h2>Standalone Payment Policy</h2>
							<ul>
								<li>Amount is authorized but not captured until trip confirmation.</li>
								<li>Funds are held on your card for up to 7 days.</li>
								<li>Cancellation before capture will release the hold.</li>
							</ul>
							<button className="policy-btn" style={{width:'120px'}} onClick={() => setAlertFlag(false)}>Close</button>
						</div>
					) || setAlertFlag(true)}
				>
					View Policy
				</button>
			</div>
			<div className="method-option">
				<label>
					<input
						type="radio"
						name="paymentMethod"
						value="capture"
						checked={paymentDetails.paymentMethod === "capture"}
						onChange={(e) =>
							setPaymentDetails({
								...paymentDetails,
								paymentMethod: e.target.value,
							})
						}
					/>
					<span className="method-title">Capture (Authorize + Capture)</span>
				</label>
				<button
					type="button"
					className="policy-btn"
					onClick={() => setAlertMessage(
						<div className="policy-popup">
							<h2>Capture Payment Policy</h2>
							<ul>
								<li>Amount is authorized and captured immediately.</li>
								<li>Refunds are processed as per our refund policy.</li>
								<li>Best for instant confirmation and seat guarantee.</li>
							</ul>
							<button className="policy-btn" style={{width:'120px'}} onClick={() => setAlertFlag(false)}>Close</button>
						</div>
					) || setAlertFlag(true)}
				>
					View Policy
				</button>
			</div>
		</div>
	);
};

export default PaymentType;
