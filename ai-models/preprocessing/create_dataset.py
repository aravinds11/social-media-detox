import pandas as pd

# Small dataset (5 users for now)
data = {
    "user_id": [1, 2, 3, 4, 5],
    "daily_screen_time": [120, 45, 300, 600, 200],
    "session_duration": [10, 5, 20, 30, 15],
    "app_switches": [15, 5, 40, 60, 25],
    "night_activity": [20, 0, 60, 120, 30],
    "label": [0, 0, 1, 1, 0]  # 0 = healthy, 1 = addicted
}

df = pd.DataFrame(data)
print(df)
df.to_csv("sample_dataset.csv", index=False)