## Модель безпеки
### 10 найкритичніших загроз з файлу [ThreatModelReport.htm](https://github.com/Nazarii1444/HomiakFinance/blob/main/security%20model/ThreatModelReport.htm):

2. An adversary can gain access to sensitive information from an API through error messages [State: Planned]

|                      |                                                                                                                                                                                                                                                                                                                                                                                                              |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Category:             | Information Disclosure                                                                                                                                                                                                                                                                                                                                                                                       |
| Description:          | An adversary can gain access to sensitive data such as the following, through verbose error messages - Server names - Connection strings - Usernames - Passwords - SQL procedures - Details of dynamic SQL failures - Stack trace and lines of code - Variables stored in memory - Drive and folder locations - Application install points - Host configuration settings - Other internal application details |
| Possible Mitigation(s): | Реалізувати правильну обробку винятків, щоб не розкривати чутливу інформацію.                                                                                                                                                                                                                                                                                                                                |
| SDL Phase:            | Implementation                                                                                                                                                                                                                                                                                                                                                                                               |


4. An adversary can gain access to sensitive data by sniffing traffic to Web API  [State: Planned]   

|                        |                                                                                                                                                                                                                                                                                                                                                                                                              |
| -----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Category: | Information Disclosure |
| Description: | An adversary can gain access to sensitive data by sniffing traffic to Web API |
| Possible Mitigation(s): | Забезпечити передачу всього трафіку Web API через HTTPS. |
| SDL Phase: | Implementation |

7. An adversary can gain unauthorized access to API end points due to unrestricted cross domain requests  [State: Planned]   

|                      |                                                                                                                                                                                                                                                                                                                                                                                                              |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|Category:|Spoofing|
|Description:|An adversary can gain unauthorized access to API end points due to weak CORS configuration|
|Possible Mitigation(s):|Дозволяти тільки довірені джерела у CORS та захиститися від CSRF атак.|
|SDL Phase:|Implementation|

11. An adversary can gain unauthorized access to database due to lack of network access protection  [State: Planned]

|                      |                                                                                                                                                                                                                                                                                                                                                                                                              |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|Category:|Elevation of Privileges|
|Description:|If there is no restriction at network or host firewall level, to access the database then anyone can attempt to connect to the database from an unauthorized location|
|Possible Mitigation(s):|Обмежити доступ до бази даних через правила брандмауера на рівні хоста/мережі.|
|SDL Phase:|Implementation|

13. An adversary can gain access to sensitive PII or HBI data in database  [State: Planned]   

|                      |                                                                                                                                                                |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
|Category:| Information Disclosure                                                                                                                                         |
|Description:| Additional controls like Transparent Data Encryption, Column Level Encryption, EKM etc. provide additional protection mechanism to high value PII or HBI data. |
|Possible Mitigation(s):| Шифрувати чутливі дані в базі за допомогою сильних алгоритмів та TDE.   |                                                                                       
|SDL Phase:| Implementation                                                                                                                                                 |

25. Attacker can deny a malicious act on an API leading to repudiation issues  [State: Planned]   

|                      |                                                                                                                                                                                                                                                                                                                                                                                                              |
|----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|Category:|Repudiation|
|Description:|Attacker can deny a malicious act on an API leading to repudiation issues|
|Possible Mitigation(s):|Включити аудит та логування всіх дій Web API.|
|SDL Phase:|Design|

28. An adversary may inject malicious inputs into an API and affect downstream processes  [State: Planned]   

|                      |                                                                                                                                                                                                                                                                                                                                                                                                              |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|Category:|Tampering|
|Description:|An adversary may inject malicious inputs into an API and affect downstream processes|
|Possible Mitigation(s):|Виконувати валідацію всіх вхідних даних та модельну валідацію.|
|SDL Phase:|Implementation|

36. An adversary may spoof Database and gain access to Web API  [State: Planned]   

|                      |                                                                                                                                                          |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
|Category:| Spoofing                                                                                                                                                 |
|Description:| If proper authentication is not in place, an adversary can spoof a source process or external entity and gain unauthorized access to the Web Application |
|Possible Mitigation(s):| Забезпечити правильну автентифікацію для всіх запитів до Web API.                                                                                        |
|SDL Phase:| Design                                                                                                                                                   |

52. An adversary can gain access to sensitive data by performing SQL injection through Web API  [State: Planned]   

|                      |           |
|-----------------------|-----------|
|Category:| Tampering |
|Description:|SQL injection is an attack in which malicious code is inserted into strings that are later passed to an instance of SQL Server for parsing and execution. The primary form of SQL injection consists of direct insertion of code into user-input variables that are concatenated with SQL commands and executed. A less direct attack injects malicious code into strings that are destined for storage in a table or as metadata. When the stored strings are subsequently concatenated into a dynamic SQL command, the malicious code is executed.|
|Possible Mitigation(s):|Використовувати параметризовані запити та безпечний доступ до бази даних.|
|SDL Phase:|Implementation|

66. An adversary may leverage the lack of monitoring systems and trigger anomalous traffic to database  [State: Planned]   

|                         |                                                                                                                                                                                                                                                                                                                                                                                                              |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Category:               |Tampering|
 | Description:            |An adversary may leverage the lack of intrusion detection and prevention  of anomalous database activities and  trigger anomalous traffic to database|
 | Possible Mitigation(s): |Включити виявлення загроз і моніторинг для бази даних.|
 | SDL Phase:              |Design|


