import sys
import requests
import json
import time
import logging
import os
from datetime import datetime, timedelta

# 🔥 ПРИНУДИТЕЛЬНЫЙ ВЫВОД ЛОГОВ В РЕАЛЬНОМ ВРЕМЕНИ (для GitHub Actions)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s: %(message)s",
    force=True,
    handlers=[logging.StreamHandler(sys.stdout)]
)
sys.stdout.reconfigure(line_buffering=True)

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
        logging.info(f"🌐 Запрос к API... (лимит: {limit})")
        r = requests.get(BASE_URL, headers=HEADERS, params=params, timeout=15)
        r.raise_for_status()
        data = r.json()
        tweets = data.get("tweets", [])
        logging.info(f"✅ API вернул {len(tweets)} твитов.")
        return data
    except requests.exceptions.Timeout:
        logging.error("⏰ Таймаут API запроса (15 сек)")
        return {}
    except Exception as e:
        logging.error(f"❌ Ошибка API: {e}")
        return {}

def parse_tweet_date(tweet):
    date_str = (
        tweet.get("created_at") or 
        tweet.get("tweet_created_at") or 
        tweet.get("created")
    )
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%a %b %d %H:%M:%S %z %Y")
    except:
        try:
            return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except:
            return None

# === ОСНОВНАЯ ЛОГИКА С ПОДРОБНЫМИ ЛОГАМИ ===
def collect_all_tweets():
    cutoff_date = datetime.now().replace(tzinfo=None) - timedelta(days=30)
    logging.info(f"📅 Собираем твиты с {cutoff_date.strftime('%Y-%m-%d')} (последние 30 дней)")
    
    all_tweets = []
    seen_ids = set()
    cursor = None
    total_collected = 0
    duplicates_skipped = 0
    
    # 🔥 ЖЁСТКИЙ ЛИМИТ: максимум 60 страниц (защита от бесконечного цикла)
    max_pages = 60
    page = 0
    
    while page < max_pages:
        page += 1
        logging.info(f"📄 СТРАНИЦА {page}/{max_pages} | Всего собрано: {total_collected}")
        
        data = fetch_tweets(cursor)
        tweets = data.get("tweets", [])
        next_cursor = data.get("next_cursor")

        if not tweets:
            logging.info("🏁 Пустая страница от API. Сбор завершён.")
            break

        # Защита от зацикливания курсора
        if next_cursor == cursor:
            logging.warning("⚠️ Курсор не изменился. Выход во избежание цикла.")
            break

        new_on_page = 0
        should_stop = False
        
        for t in tweets:
            tid = t.get("id_str")
            tweet_date = parse_tweet_date(t)
            
            if tweet_date and tweet_date.replace(tzinfo=None) < cutoff_date:
                should_stop = True
                break
            
            if tid in seen_ids:
                duplicates_skipped += 1
                continue
            seen_ids.add(tid)
            
            all_tweets.append(t)
            total_collected += 1
            new_on_page += 1
            
            # 🔥 ЛОГ КАЖДЫЕ 100 ТВИТОВ
            if total_collected % 100 == 0:
                logging.info(f"📊 Прогресс: {total_collected} твитов собрано (пропущено дублей: {duplicates_skipped})")

        logging.info(f"➕ На странице {page} добавлено {new_on_page} новых твитов.")
        
        if should_stop:
            logging.info(f"🛑 Достигнут лимит 30 дней. Сбор завершён.")
            break
            
        if not next_cursor:
            logging.info("🏁 Курсор закончился. Сбор завершён.")
            break

        cursor = next_cursor
        time.sleep(1.5)  # Пауза для стабильности API

    save_json(TWEETS_FILE, all_tweets)
    logging.info(f"\n✅ Готово! Собрано {total_collected} уникальных твитов.")
    logging.info(f"🗑️ Пропущено дубликатов: {duplicates_skipped}")
    logging.info(f"💾 Файл {TWEETS_FILE} обновлён.")
    
    return all_tweets

# === ПОСТРОЕНИЕ ЛИДЕРБОРДА ===
def build_leaderboard(tweets):
    leaderboard = {}
    for t in tweets:
        user = t.get("user")
        if not user: continue
        name = user.get("screen_name")
        if not name: continue

        stats = leaderboard.setdefault(name, {
            "posts": 0, "likes": 0, "retweets": 0, "comments": 0, "quotes": 0, "views": 0
        })

        stats["posts"] += 1
        stats["likes"] += t.get("favorite_count") or 0
        stats["retweets"] += t.get("retweet_count") or 0
        stats["comments"] += t.get("reply_count") or 0
        stats["quotes"] += t.get("quote_count") or 0
        stats["views"] += t.get("views_count") or 0

    leaderboard_list = [[user, stats] for user, stats in leaderboard.items()]
    save_json(LEADERBOARD_FILE, leaderboard_list)
    logging.info(f"📊 Лидерборд обновлён ({len(leaderboard_list)} участников).")

# === ЗАПУСК ===
if __name__ == "__main__":
    if not API_KEY:
        logging.error("❌ ОШИБКА: Переменная API_KEY не найдена!")
    else:
        logging.info("🔑 Ключ найден. Запуск сбора с детальным логированием...")
        try:
            tweets = collect_all_tweets()
            build_leaderboard(tweets)
            logging.info("✅ Воркфлоу успешно завершен.")
        except Exception as e:
            logging.error(f"💥 Критическая ошибка воркфлоу: {e}")
            sys.exit(1)
