import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './user-account.css';
import MyTrips from './MyTrips/mytrips';
import MyPayments from './myPayments/myPayments';
import MyBookings from './MyBookings/myBookings';
import Hero from './Hero/hero';
import Footer from '../footer/footer';
const MENU = [
	{ key: 'mytrips', label: 'My Trips', icon: '🚌', component: MyTrips },
	{ key: 'myPayments', label: 'My Payments', icon: '💳', component: MyPayments },
	{ key: 'myBooking', label: 'My Booking', icon: '📄', component: MyBookings },
];

export default function UserAccount() {
	const [active, setActive] = useState(null); // null means hero is shown
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const navigate = useNavigate();

	const handleSidebarSelect = (key) => {
		setActive(key);
		setSidebarOpen(false);
	};

	const handleBackdropClick = () => setSidebarOpen(false);
	const handleBack = () => navigate('/home');
	const ActiveComponent = MENU.find((item) => item.key === active)?.component || null;

	return (
		<div className="user-account-wrapper">
			<button
				className={`mobile-sidebar-toggle${sidebarOpen ? ' hide' : ''}`}
				onClick={() => setSidebarOpen(true)}
				aria-label="Open sidebar"
			>
				☰
			</button>

			<div
				className={`mobile-sidebar-backdrop${sidebarOpen ? ' show' : ''}`}
				onClick={handleBackdropClick}
				tabIndex={-1}
				aria-hidden={!sidebarOpen}
			/>

			<div className="user-account-layout">
				<aside className={`user-account-sidebar${sidebarOpen ? ' mobile-open' : ''}`}>
					<div className="user-sidebar-logo">
						<button
							className="back-button sidebar-back-btn"
							onClick={handleBack}
							aria-label="Back to homepage"
						>
							←
						</button>
						<span className="user-account-title">User Account</span>
					</div>
					<ul className="user-sidebar-menu">
						{MENU.map((item) => (
							<li
								key={item.key}
								className={active === item.key ? 'active' : ''}
								onClick={() => handleSidebarSelect(item.key)}
								tabIndex={0}
								onKeyDown={e => {
									if (e.key === 'Enter' || e.key === ' ') handleSidebarSelect(item.key);
								}}
							>
								<span className="icon">{item.icon}</span>
								<span className="text">{item.label}</span>
							</li>
						))}
					</ul>
				</aside>
				<main className="user-account-main">
					{active === null ? <Hero /> : (ActiveComponent && <ActiveComponent />)}
				</main>
			</div>
		</div>
	);
}
