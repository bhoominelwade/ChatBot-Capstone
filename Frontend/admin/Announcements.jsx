import React from "react";
import "./Announcements.css"; // Import the CSS for styling

const Announcements = () => {
  const announcements = [
    {
      title: "New Feature Release",
      description: "We're excited to announce the release of our latest feature. Check it out and let us know what you think!",
      time: "2 days ago",
    },
    {
      title: "Maintenance Scheduled",
      description: "Our platform will be undergoing scheduled maintenance on Saturday, June 10th from 2-4 AM PST. We apologize for any inconvenience.",
      time: "1 week ago",
    },
    {
      title: "New Pricing Plans",
      description: "We've updated our pricing plans to better suit the needs of our growing customer base. Check out the new options and let us know if you have any questions.",
      time: "3 days ago",
    },
  ];

  return (
    <div className="announcements-section">
      <h2>Announcements</h2>
      <p>Stay up-to-date with the latest news and updates.</p>
      {announcements.map((announcement, index) => (
        <div key={index} className="announcement-item">
          <h3>{announcement.title}</h3>
          <p>{announcement.description}</p>
          <span>{announcement.time}</span>
        </div>
      ))}
    </div>
  );
};

export default Announcements;
