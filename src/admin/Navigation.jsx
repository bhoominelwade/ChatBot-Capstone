import React from 'react';
import { Upload, Bell, BarChart2, CalendarDays, LogOut } from "lucide-react";

const Navigation = ({ activeTab, setActiveTab, onLogout }) => {
  const tabs = [
    { name: "Upload", icon: Upload },
    { name: "Announcements", icon: Bell },
    { name: "Meetings", icon: CalendarDays },
  ];

  return (
    <nav className="sidebar">
      <div className="nav-content">
        <div className="nav-top">
          <h1>Nexus Control</h1>
          <ul>
            {tabs.map((tab) => (
              <li key={tab.name}>
                <button
                  className={activeTab === tab.name ? "active" : ""}
                  onClick={() => setActiveTab(tab.name)}
                >
                  <tab.icon />
                  {tab.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button className="logout-button" onClick={onLogout}>
          <LogOut />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;