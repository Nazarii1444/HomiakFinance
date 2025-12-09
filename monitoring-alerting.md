<h2>Monitoring — операційні метрики</h2>
<table>
  <thead>
    <tr>
      <th>№</th><th>Метрика</th><th>Опис</th><th>Виміри</th><th>Інфра-ресурси</th><th>Як збираємо</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>1</td><td>API p95 latency</td><td>95-й перцентиль часу відповіді</td><td>endpoint, service, region, method</td><td>App pods, LB, DB</td><td>APM/OTel + Prometheus histograms</td></tr>
    <tr><td>2</td><td>API error rate (5xx/4xx)</td><td>Частка помилок</td><td>endpoint, service, region, status_code</td><td>App pods, DB</td><td>APM + ingress/LB metrics</td></tr>
    <tr><td>3</td><td>RPS / Throughput</td><td>Запитів за секунду</td><td>endpoint, service, region</td><td>App pods, LB</td><td>APM / ingress metrics</td></tr>
    <tr><td>4</td><td>DB CPU utilization</td><td>Завантаження CPU БД</td><td>db_instance, region</td><td>PostgreSQL instance</td><td>Cloud metrics + PG exporter</td></tr>
    <tr><td>5</td><td>DB connections used</td><td>Використання пулу з’єднань</td><td>db_instance, app_service</td><td>PostgreSQL, app pods</td><td>PG exporter (pg_stat_activity)</td></tr>
    <tr><td>6</td><td>DB slow queries</td><td>К-сть повільних запитів &gt; t</td><td>query_signature, db_instance</td><td>PostgreSQL</td><td>PG slow query log → exporter</td></tr>
    <tr><td>7</td><td>Cache hit ratio</td><td>Частка попадань у кеш</td><td>cache_cluster, app_service</td><td>Redis/Memcached</td><td>Redis exporter</td></tr>
    <tr><td>8</td><td>Worker job duration p95</td><td>Тривалість задач</td><td>job_type, worker_group</td><td>Worker pods</td><td>App histograms</td></tr>
    <tr><td>9</td><td>FX refresh success rate</td><td>Успішність оновлення курсів</td><td>job_type=fx_refresh, provider</td><td>Worker pods, outbound API</td><td>App metrics; log-to-metrics</td></tr>
    <tr><td>10</td><td>Notification delivery rate</td><td>Доставлено/відправлено</td><td>channel, event_type, region</td><td>Worker pods, email provider</td><td>App metrics; provider webhooks</td></tr>
  </tbody>
</table>

<h2>Alerting — пороги, критичність, план дій</h2>
<table>
  <thead>
    <tr>
      <th>№</th><th>Метрика / умова</th><th>Severity</th><th>Поріг</th><th>Mitigation plan</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>1</td><td>API p95 latency &gt; 500 ms (5 хв)</td><td>Critical (Prod)</td><td>max 500 ms</td><td>Перевірити реліз; scale out pods; перевірити DB CPU/locks; увімкнути кеш.</td></tr>
    <tr><td>2</td><td>API 5xx error rate &gt; 2% (5 хв)</td><td>Critical (Prod)</td><td>max 2%</td><td>Ролбек; перевірити залежності (DB/cache/queues); включити feature-flag fallback.</td></tr>
    <tr><td>3</td><td>DB CPU &gt; 85% (10 хв)</td><td>High</td><td>max 85%</td><td>Перевірити slow queries; scale up/replica; додати індекси/кеш.</td></tr>
    <tr><td>4</td><td>DB connections used &gt; 80% пулу (5 хв)</td><td>High</td><td>max 80%</td><td>Зменшити concurrency; перевірити connection leak; pgbouncer; збільшити пул.</td></tr>
    <tr><td>5</td><td>FX refresh success rate &lt; 99% (1 год)</td><td>Medium</td><td>min 99%</td><td>Переключити провайдера; повторити job; використати останній валідний курс; перевірити outbound мережу.</td></tr>
    <tr><td>6</td><td>Notification delivery rate &lt; 95% (30 хв)</td><td>Medium</td><td>min 95%</td><td>Перевірити провайдера; ретраї; fallback канал; знизити обсяг; перевірити чергу листів.</td></tr>
  </tbody>
</table>
