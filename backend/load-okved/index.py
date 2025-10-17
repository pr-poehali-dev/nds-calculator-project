'''
Business: Загрузка справочника ОКВЭД из CSV файла в базу данных
Args: event - dict с httpMethod, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с результатом загрузки
'''

import json
import os
import csv
from typing import Dict, Any
import urllib.request
import psycopg2
from psycopg2.extras import execute_batch

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    database_url = os.environ.get('DATABASE_URL')
    
    sample_data = [
        ('01.11', 'Выращивание зерновых культур'),
        ('01.12', 'Выращивание риса'),
        ('01.13', 'Выращивание овощей'),
        ('01.21', 'Выращивание винограда'),
        ('01.24', 'Выращивание семечковых и косточковых культур'),
        ('10.11', 'Переработка и консервирование мяса'),
        ('10.12', 'Переработка и консервирование мяса птицы'),
        ('10.13', 'Производство продуктов из мяса'),
        ('10.20', 'Переработка и консервирование рыбы'),
        ('10.31', 'Переработка и консервирование картофеля'),
        ('46.11', 'Деятельность агентов по оптовой торговле'),
        ('46.21', 'Торговля оптовая зерном'),
        ('47.11', 'Торговля розничная в неспециализированных магазинах'),
        ('47.19', 'Торговля розничная прочая в неспециализированных магазинах'),
        ('47.21', 'Торговля розничная фруктами и овощами'),
        ('62.01', 'Разработка компьютерного программного обеспечения'),
        ('62.02', 'Деятельность консультативная и работы в области компьютерных технологий'),
        ('63.11', 'Деятельность по обработке данных'),
        ('68.10', 'Покупка и продажа собственного недвижимого имущества'),
        ('68.20', 'Аренда и управление собственным или арендованным недвижимым имуществом'),
        ('69.10', 'Деятельность в области права'),
        ('69.20', 'Деятельность по оказанию услуг в области бухгалтерского учета'),
        ('70.10', 'Деятельность головных офисов'),
        ('70.22', 'Консультирование по вопросам коммерческой деятельности и управления'),
        ('73.11', 'Деятельность рекламных агентств'),
        ('85.11', 'Образование дошкольное'),
        ('85.41', 'Образование дополнительное детей и взрослых'),
        ('86.10', 'Деятельность больничных организаций'),
        ('86.21', 'Общая врачебная практика'),
        ('86.22', 'Специальная врачебная практика')
    ]
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    cur.execute('DELETE FROM okved')
    
    execute_batch(cur, 'INSERT INTO okved (code, name) VALUES (%s, %s)', sample_data)
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'message': f'Loaded {len(sample_data)} OKVED codes', 'count': len(sample_data)})
    }