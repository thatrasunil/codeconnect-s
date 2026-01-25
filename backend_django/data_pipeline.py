import json
import os
from collections import defaultdict
from datetime import datetime

# Pointing to the REAL log file created by Node.js
LOG_FILE = "../data/activity.log"
REPORT_FILE = "analytics_report.json"

def process_logs():
    print(f"Reading logs from: {os.path.abspath(LOG_FILE)}")
    
    if not os.path.exists(LOG_FILE):
        print("Log file not found. Waiting for backend activity...")
        return

    stats = {
        "summary": {
            "total_events": 0,
            "unique_users": set(),
            "unique_rooms": set(),
        },
        "actions_breakdown": defaultdict(int),
        "timeline": defaultdict(int) # Events per hour
    }

    try:
        with open(LOG_FILE, "r") as f:
            for line in f:
                if not line.strip(): continue
                try:
                    entry = json.loads(line)
                    
                    # Update Summary
                    stats["summary"]["total_events"] += 1
                    
                    if "user" in entry:
                         stats["summary"]["unique_users"].add(entry["user"])
                    
                    if "roomId" in entry:
                        stats["summary"]["unique_rooms"].add(entry["roomId"])
                        
                    # Breakdown
                    stats["actions_breakdown"][entry.get("action", "UNKNOWN")] += 1
                    
                    # Timeline (Hour bucket)
                    ts = datetime.fromisoformat(entry["timestamp"].replace("Z", "+00:00"))
                    hour_key = ts.strftime("%Y-%m-%d %H:00")
                    stats["timeline"][hour_key] += 1
                    
                except json.JSONDecodeError:
                    continue

        # Post-processing
        stats["summary"]["unique_users"] = list(stats["summary"]["unique_users"])
        stats["summary"]["unique_rooms"] = list(stats["summary"]["unique_rooms"])
        
        # Save Report
        with open(REPORT_FILE, "w") as f:
            json.dump(stats, f, indent=2)
            
        print("Pipeline run successful.")
        print(json.dumps(stats, indent=2))

    except Exception as e:
        print(f"Error processing logs: {e}")

if __name__ == "__main__":
    process_logs()
