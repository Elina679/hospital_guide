# 智能路径算法配置
USER_WEIGHTS = {
    "wheelchair": {
        "base_speed": 0.6,
        "weights": {"stairs": 9999, "inaccessible": 9999, "slope": 2.0, "elevator": 0.8}
    },
    "emergency": {
        "base_speed": 1.5,
        "weights": {
            "stairs": 1.0,
            "crowded": 2.5,       # 绿色通道：强烈避让拥挤路段（人少优先）
            "waiting": 1.0,       # 电梯等待惩罚减半，更偏向距离短的路径
            "shortest": 0.8,
            "green_channel": 1.0  # 标记：急症/重症绿色通道
        }
    },
    "elderly": {
        "base_speed": 0.7,
        "weights": {"stairs": 3.0, "crowded": 2.0, "elevator": 0.5}
    },
    "normal": {
        "base_speed": 1.0,
        "weights": {"stairs": 1.2, "elevator": 1.0, "crowded": 1.3}
    }
}

PATH_TYPE_COSTS = {
    "corridor": 1.0,
    "elevator": 1.0,
    "stairs": 1.0,
    "ramp": 1.1,
    "escalator": 1.0
}
# ============ 大模型配置（DeepSeek） ============
import os
from dotenv import load_dotenv
load_dotenv()  # 加载项目根目录的 .env
LLM_CONFIG = {
    "base_url": "https://api.deepseek.com/chat/completions",
    "api_key": os.getenv("DEEPSEEK_API_KEY", ""),
    "model": "deepseek-chat"
}