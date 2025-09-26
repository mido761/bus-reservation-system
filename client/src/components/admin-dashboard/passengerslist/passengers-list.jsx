import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

// Payment status badge
function PaymentBadge({ paymentMethod }) {
	if (paymentMethod === "vodafone_cash") {
		return <Badge variant="secondary">Vodafone Cash</Badge>;
	}
	if (paymentMethod === "cash") {
		return <Badge variant="outline">Cash</Badge>;
	}
	return <Badge variant="outline">Unknown</Badge>;
}

// Check-in badge
function CheckinBadge({ checkedIn }) {
	return checkedIn ? (
		<Badge variant="default">Checked In</Badge>
	) : (
		<Badge variant="destructive">Not Checked In</Badge>
	);
}

export default function PassengersList() {
	const [passengers, setPassengers] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [search, setSearch] = useState("");

	// Fetch all passengers for all buses (or you can filter by bus if needed)
	useEffect(() => {
		const fetchPassengers = async () => {
			setIsLoading(true);
			try {
				const { data } = await axios.get(`${backEndUrl}/user/all-bus-passengers`);
				// Ensure data is always an array
				if (Array.isArray(data)) {
					setPassengers(data);
				} else if (data && Array.isArray(data.passengers)) {
					setPassengers(data.passengers);
				} else {
					setPassengers([]);
				}
			} catch (err) {
				setPassengers([]);
			} finally {
				setIsLoading(false);
			}
		};
		fetchPassengers();
	}, []);

	// Filtered passengers by search (safe fallback if not array)
	const filtered = Array.isArray(passengers)
		? passengers.filter(
				(p) =>
					p.name?.toLowerCase().includes(search.toLowerCase()) ||
					p.email?.toLowerCase().includes(search.toLowerCase()) ||
					p.phone?.toLowerCase().includes(search.toLowerCase())
			)
		: [];

	return (
		<div className="max-w-4xl mx-auto py-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center">Passengers List</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
						<Input
							placeholder="Search by name,phone..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="max-w-xs"
						/>
						<span className="text-sm text-muted-foreground">Total: {filtered.length}</span>
					</div>
					<Separator className="mb-4" />
					{isLoading ? (
						<div className="text-center py-8 text-muted-foreground">Loading...</div>
					) : filtered.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">No passengers found.</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full text-sm border rounded-lg">
								<thead>
									<tr className="bg-muted text-foreground">
										<th className="px-3 py-2 text-left font-semibold">#</th>
										<th className="px-3 py-2 text-left font-semibold">Name</th>
										<th className="px-3 py-2 text-left font-semibold">Email</th>
										<th className="px-3 py-2 text-left font-semibold">Phone</th>
										<th className="px-3 py-2 text-left font-semibold">Bus</th>
										<th className="px-3 py-2 text-left font-semibold">Check-in</th>
										<th className="px-3 py-2 text-left font-semibold">Payment</th>
									</tr>
								</thead>
								<tbody>
									{filtered.map((p, idx) => (
										<tr key={p.id || idx} className="border-b last:border-0 hover:bg-accent/30">
											<td className="px-3 py-2">{idx + 1}</td>
											<td className="px-3 py-2 font-medium">{p.name}</td>
											<td className="px-3 py-2">{p.email}</td>
											<td className="px-3 py-2">{p.phone}</td>
											<td className="px-3 py-2">{p.bus_number || p.busName || "-"}</td>
											<td className="px-3 py-2">
												<CheckinBadge checkedIn={p.checked_in} />
											</td>
											<td className="px-3 py-2">
												<PaymentBadge paymentMethod={p.payment_method} />
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
