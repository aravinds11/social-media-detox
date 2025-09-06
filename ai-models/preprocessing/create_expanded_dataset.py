import pandas as pd
import random
import numpy as np

# Function to generate synthetic user data
def generate_user_data(num_samples=100):
    data = []
    for user_id in range(1, num_samples+1):
        daily_screen_time = random.randint(30, 600)  # Between 30 minutes to 10 hours
        session_duration = random.randint(5, 120)  # Session length between 5-120 minutes
        app_switches = random.randint(5, 80)  # Number of app switches
        night_activity = random.randint(0, daily_screen_time//2)  # Late-night usage

        # Simulate addiction label (1 = addicted, 0 = healthy)
        if daily_screen_time > 300 or session_duration > 60 or night_activity > 60:
            label = 1  # Addicted
        else:
            label = 0  # Healthy

        # Add data row
        data.append([user_id, daily_screen_time, session_duration, app_switches, night_activity, label])

    # Create DataFrame
    df = pd.DataFrame(data, columns=["user_id", "daily_screen_time", "session_duration", "app_switches", "night_activity", "label"])
    return df

# Generate 100 users
df_extended = generate_user_data(100)

# Save to CSV
df_extended.to_csv("../preprocessing/expanded_dataset.csv", index=False)

# Preview the new dataset
print(df_extended.head())
