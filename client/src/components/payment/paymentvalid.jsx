import React from "react";
import { Button } from "@/components/ui/button";

const PaymentValid = ({ paymentMethodLabel, onConfirm, onClose }) => (
	<div className="rounded-lg bg-background p-6 shadow-md max-w-md mx-auto text-center">
		<h2 className="text-xl font-semibold mb-2">Confirm Payment Method</h2>
		<p className="mb-4">You have selected: <b>{paymentMethodLabel}</b></p>
		<div className="flex gap-2 justify-center">
			<Button variant="default" onClick={onConfirm}>Confirm</Button>
			<Button variant="outline" onClick={onClose}>Cancel</Button>
		</div>
	</div>
);

export default PaymentValid;
