'''
Business: Получение списка ОКВЭД с поиском по названию
Args: event - dict с httpMethod, queryStringParameters (search, limit, offset)
      context - object с attributes: request_id, function_name
Returns: HTTP response dict со списком ОКВЭД
'''

import json
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters', {}) or {}
    search = params.get('search', '').strip()
    limit = min(int(params.get('limit', '100')), 1000)
    offset = int(params.get('offset', '0'))
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    if search:
        search_pattern = f'%{search}%'
        cur.execute(
            'SELECT code, name FROM okved WHERE name ILIKE %s OR code ILIKE %s ORDER BY code LIMIT %s OFFSET %s',
            (search_pattern, search_pattern, limit, offset)
        )
    else:
        cur.execute('SELECT code, name FROM okved ORDER BY code LIMIT %s OFFSET %s', (limit, offset))
    
    results = [{'code': row[0], 'name': row[1]} for row in cur.fetchall()]
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'items': results, 'count': len(results)})
    }
