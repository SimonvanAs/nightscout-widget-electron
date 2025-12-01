<a href="#"><img width="256" height="256" src="../asset/owlet_main_icon.png" align="left" /></a>


# Owlet

Это кросс-платформенное приложение, использующее инструменты [Nightscout API](https://nightscout.github.io/) с целью предоставить лаконичный интерфейс для наблюдения за показателями уровня сахара в крови людей с сахарным диабетом `T1D` в режиме реального времени.

Название приложения - "Owlet" (произносится Алет) -  переводится как совёнок, оно было выбрано мной по схожести логотипа Nightscout со взрослой совой.

<div>
  <a href="https://github.com/kashamalasha/nightscout-widget-electron/releases"><img src="https://img.shields.io/github/downloads/kashamalasha/nightscout-widget-electron/total?color=%2300834a" /></a>
  <a href="https://github.com/kashamalasha/nightscout-widget-electron/releases/latest"><img src="https://img.shields.io/github/downloads/kashamalasha/nightscout-widget-electron/latest/total?color=%2300834a&label=latest" /></a>
  <a href="https://github.com/kashamalasha/nightscout-widget-electron/releases/latest"><img src="https://img.shields.io/github/v/release/kashamalasha/nightscout-widget-electron?color=%2300834a" /></a>
</div>
<div style="margin-top: 5px">
  <a style="margin: 5px;" href="https://boosty.to/owlet/donate"><img src="./support_me_boosty.png" width="130" alt="Donate me on Boosty"/></a>
  <a style="margin: 5px;" href="https://www.paypal.com/donate/?business=46K7J6S3UB3CS&no_recurring=0&item_name=Support+Owlet%3A+Improve+T1D+care+with+a+donation%21+Your+contribution+empowers+health+monitoring.+Join+me+in+making+a+difference%21&currency_code=USD"><img src="./support_me_paypal.png" width="130" alt="Donate me on PayPal"/></a>
</div>

## Перевод README

[![EN](https://img.shields.io/badge/Language-EN-red.svg)](https://github.com/kashamalasha/nightscout-widget-electron/blob/main/README.md) 
[![IT](https://img.shields.io/badge/Language-IT-red.svg)](https://github.com/kashamalasha/nightscout-widget-electron/blob/main/docs/README.it.md)
[![PL](https://img.shields.io/badge/Language-PL-red.svg)](https://github.com/kashamalasha/nightscout-widget-electron/blob/main/docs/README.pl.md)


## Описание проекта

Приложение представляет собой виджет, который располагается поверх всех окон на рабочем столе вашего компьютера. Таким образом, вам не требуется постоянно держать открытой вкладку браузера со страницей Nightscout, чтобы быть в курсе состояния вашего ребенка или родственника.

Я вдохновлялся решением [mlukasek/M5_NightscoutMon](https://github.com/mlukasek/M5_NightscoutMon), собранным на аппаратном стэке [M5 Stack's](https://m5stack.com/).

<img src="../docs/screenshot-widget.png" alt="Screenshot-widget" width="300"/>


## Установка приложения

[![Download for Windows](https://img.shields.io/badge/Download-Windows%20.exe-blue?style=for-the-badge&logo=windows)](https://github.com/kashamalasha/nightscout-widget-electron/releases/download/v0.8.2-beta/Owlet-0.8.2-beta-win-x64.exe)

[![Download for macOS(Apple Silicon)](https://img.shields.io/badge/Download-macOS%20(Apple%20Silicon)%20.dmg-blue?style=for-the-badge&logo=apple)](https://github.com/kashamalasha/nightscout-widget-electron/releases/download/v0.8.2-beta/Owlet-0.8.2-beta-mac-arm64.dmg)

[![Download for macOS(Intel)](https://img.shields.io/badge/Download-macOS%20(Intel)%20.dmg-blue?style=for-the-badge&logo=apple)](https://github.com/kashamalasha/nightscout-widget-electron/releases/download/v0.8.2-beta/Owlet-0.8.2-beta-mac-x64.dmg)

[![Download for Linux](https://img.shields.io/badge/Download-Linux%20.AppImage-blue?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/kashamalasha/nightscout-widget-electron/releases/download/v0.8.2-beta/Owlet-0.8.2-beta-linux-x86_64.AppImage)

[![Download Souces](https://img.shields.io/badge/Download-Sources%20.tar.gz-blue?style=for-the-badge&logo=electron&logoColor=white)](https://github.com/kashamalasha/nightscout-widget-electron/archive/refs/tags/v0.8.2-beta.tar.gz)

[![Download Souces](https://img.shields.io/badge/Browse-Latest%20Release-red?style=for-the-badge&logo=github&logoColor=white)](https://github.com/kashamalasha/nightscout-widget-electron/releases/latest)

<details>
  <summary>Информация для <b>LINUX</b> пользователей, откройте и прочтите.. </summary>
  <br>
  Виджет упакован в [AppImage](https://appimage.org/) пакет потому что:

  - Он запускается на любом известном Linux дистрибутиве
  - Он поддерживает функцию авто-обновления (с особенностями работы с уведомлениями)
  - AppImage упрощает процесс разработки и тестирования под Linux 

  Я рекомендую использовать [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) для полноценной установки AppImage на ваш дистрибутив. Это позволяет автоматически создать `.desktop` файл для запуска с GUI. Однако, вы можете самостоятельно настроить окружение для работы с приложением. Можно запустить приложение сразу же после загрузки, самостоятельно выбрать расположение для файла и вручную создать `.desktop` файл.

  Пожалуйста установите перечисленные зависимости, используя системный менеджер пакетов:

  - wmctrl
  - xdg-utils

  Без этих зависимостей виджет будет работать, но может быть затруднена работа с некоторыми функциями приложения. **wmctrl** используется для сокрытия приложения на панели приложений и в системном лотке (трее). **xdg-open** используется для вызова браузера при переходе на сайт Nightscout и для открытия файлового менеджера при переходе к просмотру логов.

  Без этих пакетов, приложение будет напоминать о необходимости их установки при каждом запуске один раз в день.

  <b>Функция автоматического обновления может периодически "подвешивать" приложение</b>. При запуске приложение выполняет автоматическую провеку на наличие доступных обновлений. Если новая версия приложения опубликована, она будет загружена, и AppImage на вашем диске будет заменен ею. Обычно это занимает 1-2 минуты. Если приложение при запуске подвисло и не реагирует на действия пользователя, вам нужно подождать какое-то время, пока оно не отвиснет. Вы также можете убить процесс через `ps` команду в консоли и перезапустить приложение вручную.

  AppImage использует встроенный в ваш дистрибутив механизм уведомления пользователя об обновлениях. Если notification-daemon не прописан должным образом в dbus сервисах, обновление AppImage вызывает подвисания. Если notification daemon настроен должным образом (выполнение команды `notify-send "Hello world"` в консоли вернет уведомление на рабочий стол), проблем быть не должно и вы увидите уведомление об обновлении точно так же, как его видят пользователи Windows и MacOS. Если у вас есть понимание того, как можно выполнять проверку на корректность настройки notification-daemon и получать понятно интерпретируемый output (`notify-send "You shouldn't see me" && echo $?`) без вывода уведомления на экран, я буду рад обратной связи в любом виде. Будь то pull request с готовым решением, или просто совет через личные сообщения.

</details>


## ⚠️ Прежде чем начать

> ‼️ **ЭТО ОЧЕНЬ ВАЖНО**: Вы должны убедиться, что все шаги пройдены, прежде чем выполнять первый запуск приложения!

1. Залогиньтесь в панель администратора на вашем сайте Nightscout (например https://some-cgm.site.com/admin/)
2. Создайте новую роль с правами доступа на чтение данных используя правило `*:*:read`
3. Создайте новый субъект для приложения с ранее созданной ролью на шаге 2, или используйте существующую роль с правилом на чтение данных `*:*:read`
4. Скопируйте созданный для нового субъекта токен в буфер обмена или сохрание его


## Первый запуск

При первом запуске приложение предложит вам определить следующие параметры:

<figure>
  <p>
    <img src="../docs/screenshot-settings-default-ru.png" alt="Screenshot-widget"/>
  </p>
</figure>


### 1. Настройки Nightscout API

- **NIGHTSCOUT АДРЕС** - адрес вашего Nightscout сайта (напр. https://some-cgm.fly.dev) 
- **NIGHTSCOUT ТОКЕН** - токен доступа, который вы создали ранее (напр. owlet-12a000b12345c444)
- **ЧАСТОТА ЗАПРОСА ДАННЫХ В NIGHTSCOUT (CЕК.)** - (*по-умолчанию: 60*) интервал запроса данных от Nightscout сайта для отображения измерений в виджете


### 2. Настройки отображения

- **ИНФО: НЕТ ДАННЫХ (МИН.)** - (*по-умолчанию: 20*) интервал просрочки получения данных. При наступлении просрочки виджет сменит внешний вид на "замерзшее" состояние. Обычно это означает, что считыватель или передатчик находятся в состоянии offline (села батарея телефона или считывателя) или сенсор вышел из строя и престал передавать результаты измерений. Если вам не нужно информирование о недоступности источника данных, можно установить это значение в 0. Максимально возможная величина для установки значения и для отображения на виджете - 999 минут.

<img src="../docs/screenshot-widget-frozen.png" alt="Screenshot-widget" width="200"/>

- **ВРЕМЯ ПОСЛ. ЗАМЕРА** - (*по-умолчанию: включено*) эта опция позволяет отображать информацию о том, как давно было получено последнее измерение

- **ЗНАЧЕНИЯ В MMOL/L** - (*по-умолчанию: включено*) эта опция позволяет установить единицы измерения mmol/l вместо mg/dl. Если вы решили изменить эту настройку, убедитесь, что вы прoверили параметры настроек контроля уровня глюкозы в соответствии с выбранными единицами измерения. Не забудьте сохранить настройки после выбора единиц измерения.

- **РАСЧЕТ ТРЕНДА** - (*по-умолчанию: выключено*) эта опция включает расчет направление тренда, используя последние 6 полученных измерений (последние 30 минут). 
Эта функция может пригодиться, если ваш сенсор не имеет встроенной функции расчета тренда (напр. Dexcom или Medtronic), и Nightscout не хранит эту информацию; в таких случаях вы всегда будете видеть символ ` - ` в правом нижнем углу виджета вместо стрелки с направлением тренда.

Для определения направления тренда используется алгоритм, заложеннй в сенсорах Abbot™ FreeStyle Libre™:

<figure>
  <p>
    <img src="../docs/fs-libre-trend-arrows.png" alt="Screenshot-widget"/>
  </p>
</figure>

Рекомендации по работе с трендом и особенностями корректировки при различном направлении можно найти в опубликованной стате журнала **Journal of the Endocrine Society**: [Approach to Using Trend Arrows in the FreeStyle Libre Flash Glucose Monitoring Systems in Adults](https://academic.oup.com/jes/article/2/12/1320/5181247). 

[PDF копия](docs/js.2018-00294.pdf) доступна для скачивания.


### 3. Настройки контроля уровня глюкозы

Настройка параметров отображения уровней контроля сахара в крови. Задайте параметры отображения, используя следующие правила:

- Значения выше уровня **НЕДОПУСТИМАЯ ГИПЕРГЛИКЕМИЯ** (*по-умолчанию: 10*) и ниже уровня **НЕДОПУСТИМАЯ ГИППОГЛИКЕМИЯ** (*по-умолчанию: 3.5*) будут окрашены в красный цвет

<img src="../docs/screenshot-widget-critical.png" alt="Screenshot-widget" width="200"/>

- Значения выше уровня **ЦЕЛЕВОЙ УРОВЕНЬ: ВЕРХ** (*по-умолчанию: 8.5*) и ниже уровня **ЦЕЛЕВОЙ УРОВЕНЬ: НИЗ** (*по-умолчанию: 4*) будут окрашены в желтый цвет

<img src="../docs/screenshot-widget-warning.png" alt="Screenshot-widget" width="200"/>

- По-умолчанию, последнее полученное значение (в пределах целевого уровня) окрашивается в зеленый

<img src="../docs/screenshot-widget-ok.png" alt="Screenshot-widget" width="200"/>

- Вы можете проверить корректность настроек подключения к сайту Nightscout, нажав кнопку **ТЕСТ**, чтобы убедиться в работоспособности токена и доступности Nightscout.
- Если все настройки заданы и проверены, нажмите кнопку **CОХРАНИТЬ**, чтобы сохранить настройки и перезапустить приложение


### 4. Язык настроек и локализация приложения

- Вы можете изменить язык настроек, кликнув в левый верхний угол приложения, и выбрав предпочтительный для отображения язык из меню.

<figure>
  <p>
    <img src="../docs/screenshot-settings-language-ru.png" alt="Screenshot-widget" width="400"/>
  </p>
</figure>

- В настоящий момент поддерживаются следующие языки: 
  - English
  - Hebrew
  - Italian
  - Polish
  - Russian
  - Slovak
  - Spanish

- Если вы хорошо владеете другим языком, то можете поучаствовать в переводе приложения, подключившись к проекту локализации на [POEditor](https://poeditor.com/join/project/PzcEMSOFc7) в качестве контрибутора


## Использование виджета

- После перезапуска виджет отобразит полученное значение и останется поверх всех окон до тех пор, пока вы не решите **закрыть** его, кликнув в левый верхний угол на символ Х
- Если вы хотите **изменить настройки**, вы в любой момент можете это сделать, кликнув на значок шестерни в левом нижнем углу виджета
- Если вы захотите **быстро перейти на сайт Nightscout**, вы можете кликнуть в среднюю кнопку левого края виджета со значком графика


## Авто обновления

- Приложение имеет встроенный механизм автоматической проверки обновлений
- Приложение будет проверять наличие обновлений при запуске, но не чаще, чем раз в сутки
- Если обновление доступно, приложение автоматически его загрузит и установит сразу после закрытия виджета.
- На операционных системах **MacOS** и **Windows**, пользователь получит уведомление о том, что была загружена новая версия приложения
- На операционной системе **Linux**, уведомления об обновлении не всегда могут работать корректно (см. выше)


## Задачи в работе

- Покрытие кода приложения unit тестами с использованием [Jest](https://jestjs.io/)
- Создание лэндинг страницы проекта с использованием [Jekyll](https://jekyllrb.com/)
- Замена движка Electron на [Tauri app](https://beta.tauri.app/)

Если вы чувствуете в себе силы что-то улучить или помочь, я буду рад. 
Вы можете предложить идею или сообщить об ошибке, создав заявку на [доске](https://github.com/users/kashamalasha/projects/2/views/1).


## Сборка из исходников

Для клонирования и запуска приложения из репозитория вам потребуются [Git](https://git-scm.com) и [Node.js](https://nodejs.org/en/download/) (который поставляется с [npm](http://npmjs.com)) установленные на вашем ПК. Для сборки из исходного кода в командной строке выполните:

```bash
# Клонирует master ветку репозитория
git clone https://github.com/kashamalasha/nightscout-widget-electron
# Переходит в папку с клоном репозитория
cd nightscout-widget-electron
# Устанавливает недостающие зависимости
npm install
# Запускает приложение
npm start
# Или запускает приложение в developer mode для более детального логирования и отладки
npm run dev
```

## Поддерживаемые операционные системы

Приложение совместимо и протестировано на:
* Apple MacOS (10.10+) 
* Microsoft Windows (10+)
* Linux (протестировано на: Ubuntu, Fedora, CentOS, Alma на GNOME Desktop и XFCE)


## Дополнительные ресурсы

- [Nightscout API v3](https://github.com/nightscout/cgm-remote-monitor/blob/master/lib/api3/doc/tutorial.md) - документация для Nightscout API v3
- [Icons8.com](https://icons8.com/) - отличные иконки и картинки, которые используются в этом проекте
- [POEditor](https://poeditor.com/join/project/PzcEMSOFc7) - проект локализации приложения


## Лицензия

[GNU GPL v3](LICENSE.md)

## Обратная связь

Обратную связь вы можете оставить следующим путем:
- dmitry.burnyshev@gmail.com
- https://linkedin.com/in/diburn
- https://t.me/diburn

🙏 Я заранее признателен любой обратной связи.
