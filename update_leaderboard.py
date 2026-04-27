import requests
import json
import time
import logging
import os
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")

# === НАСТРОЙКИ ===
API_KEY = os.getenv("API_KEY")
COMMUNITY_ID = "1896991026272723220"
BASE_URL = f"https://api.socialdata.tools/twitter/community/{COMMUNITY_ID}/tweets"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

TWEETS_FILE = "all_tweets.json"
LEADERBOARD_FILE = "leaderboard.json"

# === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def fetch_tweets(cursor=None, limit=50):
    params = {"type": "Latest", "limit": limit}
    if cursor:
        params["cursor"] = cursor
    try:
        r = requests.get(BASE_URL, headers=HEADERS, params=params)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        logging.error(f"Ошибка API: {e}")
        return {}

def parse_tweet_date(tweet):
    """Извлекает дату твита из разных возможных полей"""
    date_str = (
        tweet.get("created_at") or 
        tweet.get("tweet_created_at") or 
        tweet.get("created")
    )
    if not date_str:
        return None
    
    try:
        # Twitter формат: "Mon Apr 27 12:34:56 +0000 2026"
        return datetime.strptime(date_str, "%a %b %d %H:%M:%S %z %Y")
    except:
        try:
            # ISO формат
            return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except:
            return None

# === ОСНОВНАЯ ЛОГИКА (ПРОСТАЯ: СБРОС + СБОР 30 ДНЕЙ) ===
def collect_all_tweets():
    # 1. Определяем дату 30 дней назад
    cutoff_date = datetime.now().replace(tzinfo=None) - timedelta(days=30)
    logging.info(f"📅 Собираем твиты с {cutoff_date.strftime('%Y-%m-%d')} (последние 30 дней)")
    
    all_tweets = []
    cursor = None
    total_collected = 0
    old_reached = False
    
    # 2. Цикл сбора с начала (от новых к старым)
    while True:
        data = fetch_tweets(cursor)
        tweets = data.get("tweets", [])
        cursor = data.get("next_cursor")

        if not tweets:
            logging.info("🏁 API вернул пустую страницу. Сбор завершен.")
            break

        for t in tweets:
            tweet_date = parse_tweet_date(t)
            
            # Проверяем дату: если старше 30 дней — останавливаемся
            if tweet_date and tweet_date.replace(tzinfo=None) < cutoff_date:
                old_reached = True
                break
            
            all_tweets.append(t)
            total_collected += 1
        
        if total_collected % 100 == 0:
            logging.info(f"📥 Загружено {total_collected} твитов...")
        
        # Остановка если достигли старых твитов или кончился курсор
        if old_reached:
            logging.info(f"🛑 Достигли твитов старше 30 дней. Остановка.")
            break
            
        if not cursor:
            logging.info("🏁 Курсор закончился. Сбор завершен.")
            break

        time.sleep(1)  # Пауза между запросами

    # 3. Сохраняем результат (перезаписываем файл полностью)
    save_json(TWEETS_FILE, all_tweets)
    logging.info(f"\n✅ Готово! Собрано {total_collected} твитов за последние 30 дней.")
    logging.info(f"💾 Файл {TWEETS_FILE} обновлён.")
    
    return all_tweets


# === ПОСТРОЕНИЕ ЛИДЕРБОРДА ===
def build_leaderboard(tweets):
    leaderboard = {}

    for t in tweets:
        user = t.get("user")
        if not user:
            continue
        name = user.get("screen_name")
        if not name:
            continue

        stats = leaderboard.setdefault(name, {
            "posts": 0,
            "likes": 0,
            "retweets": 0,
            "comments": 0,
            "quotes": 0,
            "views": 0
        })

        stats["posts"] += 1
        stats["likes"] += t.get("favorite_count", 0)
        stats["retweets"] += t.get("retweet_count", 0)
        stats["comments"] += t.get("reply_count", 0)
        stats["quotes"] += t.get("quote_count", 0)
        stats["views"] += t.get("views_count", 0)

    leaderboard_list = [[user, stats] for user, stats in leaderboard.items()]
    save_json(LEADERBOARD_FILE, leaderboard_list)
    logging.info(f"📊 Лидерборд обновлён ({len(leaderboard_list)} участников).")


# === ЗАПУСК ===
if __name__ == "__main__":
    if not API_KEY:
        logging.error("❌ ОШИБКА: Переменная API_KEY не найдена!")
    else:
        logging.info("🔑 Ключ найден. Запуск простого сбора за 30 дней...")
        tweets = collect_all_tweets()
        build_leaderboard(tweets)
        logging.info("✅ Воркфлоу успешно завершен.")
