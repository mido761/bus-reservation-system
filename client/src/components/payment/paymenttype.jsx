import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify"; 
const PaymentType = ({ paymentDetails, setPaymentDetails, setAlertMessage, setAlertFlag }) => {
	const policyPopup = (title, items) => (
		<div className="rounded-lg bg-background p-6 shadow-md max-w-md mx-auto text-left">
			<h2 className="text-lg font-semibold mb-2">{title}</h2>
			<ul className="mb-4 list-disc pl-5 text-sm">
				{items.map((item, idx) => <li key={idx}>{item}</li>)}
			</ul>
			<div className="flex">
				<Button variant="outline" onClick={() => setAlertFlag(false)} style={{width:'120px'}}>Close</Button>
			</div>
		</div>
	);

	return (
		<div className="space-y-4">
			{/* Cash Option */}
			<div className="flex items-center gap-2 justify-between">
				<label className="flex items-center gap-2 cursor-pointer px-2 py-2 rounded-md transition hover:bg-accent focus-within:ring-2 focus-within:ring-primary">
					<span className="relative flex items-center">
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
							className="peer appearance-none w-5 h-5 border-2 border-primary rounded-full checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition"
						/>
						<span className="absolute left-0 top-0 w-5 h-5 flex items-center justify-center pointer-events-none">
							{paymentDetails.paymentMethod === "cash" && (
								<span className="block w-3 h-3 bg-primary rounded-full"></span>
							)}
						</span>
					</span>
					<span className="font-medium ml-2">Cash</span>
				</label>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => {
						setAlertMessage(policyPopup("Cash Payment Policy", [
							"Pay directly to the bus driver before boarding.",
							"Reservation is held for 15 minutes before departure.",
							"No online refund for cash payments."
						]));
						setAlertFlag(true);
					}}
				>
					View Policy
				</Button>
			</div>
			{/* Standalone Option */}
			<div className="flex items-center gap-2 justify-between">
				<label className="flex items-center gap-2 cursor-pointer px-2 py-2 rounded-md transition hover:bg-accent focus-within:ring-2 focus-within:ring-primary">
					<span className="relative flex items-center">
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
							className="peer appearance-none w-5 h-5 border-2 border-primary rounded-full checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition"
						/>
						<span className="absolute left-0 top-0 w-5 h-5 flex items-center justify-center pointer-events-none">
							{paymentDetails.paymentMethod === "standalone" && (
								<span className="block w-3 h-3 bg-primary rounded-full"></span>
							)}
						</span>
					</span>
					<span className="font-medium ml-2">Standalone</span>
				</label>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => {
						setAlertMessage(policyPopup("Standalone Payment Policy", [
							"Amount is authorized but not captured until trip confirmation.",
							"Funds are held on your card for up to 7 days.",
							"Cancellation before capture will release the hold."
						]));
						setAlertFlag(true);
					}}
				>
					View Policy
				</Button>
			</div>
			{/* Capture Option */}
			<div className="flex items-center gap-2 justify-between">
				<label className="flex items-center gap-2 cursor-pointer px-2 py-2 rounded-md transition hover:bg-accent focus-within:ring-2 focus-within:ring-primary">
					<span className="relative flex items-center">
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
							className="peer appearance-none w-5 h-5 border-2 border-primary rounded-full checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition"
						/>
						<span className="absolute left-0 top-0 w-5 h-5 flex items-center justify-center pointer-events-none">
							{paymentDetails.paymentMethod === "capture" && (
								<span className="block w-3 h-3 bg-primary rounded-full"></span>
							)}
						</span>
					</span>
					<span className="font-medium ml-2">Capture</span>
				</label>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => {
						setAlertMessage(policyPopup("Capture Payment Policy", [
							"Amount is authorized and captured immediately.",
							"Refunds are processed as per our refund policy.",
							"Best for instant confirmation and seat guarantee."
						]));
						setAlertFlag(true);
					}}
				>
					View Policy
				</Button>
			</div>
		</div>
	);
};

export default PaymentType;
