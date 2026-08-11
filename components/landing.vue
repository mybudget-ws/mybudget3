<script setup>
import {
  IconArrowsExchange,
  IconWallet,
  IconBuilding,
  IconTarget,
  IconBriefcase,
  IconChartLine,
  IconArrowDownRight,
  IconHome,
  IconCar,
  IconShoppingCart,
  IconDeviceMobile,
  IconCheck,
} from '@tabler/icons-vue';
</script>

<template>
  <div class='landing'>
    <section class='hero'>
      <div class='hero-glow'/>

      <div class='hero-content'>
        <h1 class='hero-title'>
          Домашняя бухгалтерия
          <span>для полного контроля финансов</span>
        </h1>

        <p class='hero-description'>
          Доходы, расходы, счета, имущество, финансовые цели,
          проекты и&nbsp;аналитика — в одном месте.
        </p>

        <div class='hero-actions'>
          <NuxtLink to='/sign_up' class='btn btn-primary btn-lg'>
            Начать пользоваться
          </NuxtLink>

          <NuxtLink to='/sign_in' class='btn btn-ghost-primary btn-lg'>
            Войти
          </NuxtLink>
        </div>
      </div>

      <div class='dashboard-preview'>
        <div class='preview-window'>
          <div class='preview-header'>
            <div class='preview-dots'>
              <span/>
              <span/>
              <span/>
            </div>

            <div class='preview-title'>
              MyBudget
            </div>

            <div class='preview-user'>
              <span class='avatar avatar-sm'>
                А
              </span>
            </div>
          </div>

          <div class='preview-body'>
            <div class='preview-sidebar'>
              <div class='preview-logo'>
                <div class='preview-logo-icon'>
                  M
                </div>

                <span>MyBudget</span>
              </div>

              <div class='preview-nav-item active'>
                <IconChartLine :size='16' />
                <span>Обзор</span>
              </div>

              <div class='preview-nav-item'>
                <IconArrowsExchange :size='16' />
                <span>Операции</span>
              </div>

              <div class='preview-nav-item'>
                <IconWallet :size='16' />
                <span>Счета</span>
              </div>

              <div class='preview-nav-item'>
                <IconTarget :size='16' />
                <span>Цели</span>
              </div>
            </div>

            <div class='preview-main'>
              <div class='preview-page-title'>
                <div>
                  <div class='preview-muted'>
                    Добро пожаловать
                  </div>

                  <strong>
                    Финансовый обзор
                  </strong>
                </div>

                <span class='preview-date'>
                  Август 2026
                </span>
              </div>

              <div class='preview-stats'>
                <div class='preview-stat'>
                  <span>Общий баланс</span>
                  <strong>684 500 ₽</strong>
                  <small class='text-success'>
                    +8,4%
                  </small>
                </div>

                <div class='preview-stat'>
                  <span>Доходы</span>
                  <strong>286 000 ₽</strong>
                  <small class='text-success'>
                    +12,2%
                  </small>
                </div>

                <div class='preview-stat'>
                  <span>Расходы</span>
                  <strong>142 800 ₽</strong>
                  <small class='text-danger'>
                    +3,7%
                  </small>
                </div>
              </div>

              <div class='preview-content-grid'>
                <div class='preview-chart-card'>
                  <div class='preview-card-header'>
                    <span>Динамика баланса</span>
                    <span class='preview-card-muted'>
                      6 месяцев
                    </span>
                  </div>

                  <div class='preview-chart'>
                    <div class='chart-grid'/>

                    <svg
                      viewBox='0 0 600 180'
                      preserveAspectRatio='none'
                    >
                      <defs>
                        <linearGradient
                          id='chartGradient'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='0%'
                            stop-color='var(--tblr-primary)'
                            stop-opacity='.18'
                          />
                          <stop
                            offset='100%'
                            stop-color='var(--tblr-primary)'
                            stop-opacity='0'
                          />
                        </linearGradient>
                      </defs>

                      <path
                        d='M0,145 C50,135 65,142 100,125 C145,102 165,120 205,105 C245,90 260,100 300,82 C340,63 355,82 395,65 C435,48 450,57 490,38 C530,20 550,35 600,12 L600,180 L0,180 Z'
                        fill='url(#chartGradient)'
                      />

                      <path
                        d='M0,145 C50,135 65,142 100,125 C145,102 165,120 205,105 C245,90 260,100 300,82 C340,63 355,82 395,65 C435,48 450,57 490,38 C530,20 550,35 600,12'
                        fill='none'
                        stroke='var(--tblr-primary)'
                        stroke-width='3'
                        vector-effect='non-scaling-stroke'
                      />
                    </svg>
                  </div>
                </div>

                <div class='preview-transactions'>
                  <div class='preview-card-header'>
                    <span>Последние операции</span>
                    <span class='preview-card-muted'>
                      Все
                    </span>
                  </div>

                  <div class='preview-transaction'>
                    <div class='transaction-icon income'>
                      <IconArrowDownRight :size='15' />
                    </div>

                    <div class='transaction-info'>
                      <strong>Зарплата</strong>
                      <span>Сегодня</span>
                    </div>

                    <strong class='text-success'>
                      +180 000 ₽
                    </strong>
                  </div>

                  <div class='preview-transaction'>
                    <div class='transaction-icon expense'>
                      <IconShoppingCart :size='15' />
                    </div>

                    <div class='transaction-info'>
                      <strong>Продукты</strong>
                      <span>Сегодня</span>
                    </div>

                    <strong>
                      −4 250 ₽
                    </strong>
                  </div>

                  <div class='preview-transaction'>
                    <div class='transaction-icon expense'>
                      <IconCar :size='15' />
                    </div>

                    <div class='transaction-info'>
                      <strong>Автомобиль</strong>
                      <span>Вчера</span>
                    </div>

                    <strong>
                      −3 500 ₽
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <main class='landing-content'>
      <section class='features-section'>
        <div class='section-heading'>
          <span class='section-eyebrow'>
            Возможности
          </span>

          <h2>
            Всё необходимое в одном месте
          </h2>

          <p>
            MyBudget объединяет основные инструменты для управления
            личными финансами в единую систему.
          </p>
        </div>

        <div class='features-grid'>
          <div class='feature-card'>
            <div class='feature-icon'>
              <IconArrowsExchange :size='24' />
            </div>

            <h3>Операции</h3>

            <p>
              Учитывайте доходы, расходы и переводы между счетами.
              Сохраняйте полную историю движения денег.
            </p>
          </div>

          <div class='feature-card'>
            <div class='feature-icon'>
              <IconWallet :size='24' />
            </div>

            <h3>Счета</h3>

            <p>
              Банковские карты, наличные, накопления и другие
              источники средств в одной системе.
            </p>
          </div>

          <div class='feature-card'>
            <div class='feature-icon'>
              <IconBuilding :size='24' />
            </div>

            <h3>Имущество</h3>

            <p>
              Учитывайте недвижимость, автомобили и другие активы,
              отслеживая изменение их стоимости.
            </p>
          </div>

          <div class='feature-card'>
            <div class='feature-icon'>
              <IconTarget :size='24' />
            </div>

            <h3>Цели</h3>

            <p>
              Планируйте накопления, определяйте сроки и
              отслеживайте прогресс движения к цели.
            </p>
          </div>

          <div class='feature-card'>
            <div class='feature-icon'>
              <IconBriefcase :size='24' />
            </div>

            <h3>Проекты</h3>

            <p>
              Отделяйте крупные события и задачи от повседневных
              расходов.
            </p>
          </div>

          <div class='feature-card'>
            <div class='feature-icon'>
              <IconChartLine :size='24' />
            </div>

            <h3>Аналитика</h3>

            <p>
              Превращайте накопленные данные в понятные графики,
              отчёты и финансовые показатели.
            </p>
          </div>
        </div>
      </section>

      <section class='feature-section'>
        <div class='section-layout'>
          <div class='section-copy'>
            <div class='section-icon'>
              <IconArrowsExchange :size='24' />
            </div>

            <span class='section-eyebrow'>
              Операции
            </span>

            <h2>
              Каждая операция становится частью вашей финансовой истории
            </h2>

            <p>
              Любая система управления финансами начинается с простого
              действия — добавления операции.
            </p>

            <p>
              В MyBudget вы можете учитывать доходы, расходы и переводы
              между своими счетами. Для каждой операции сохраняются дата,
              сумма, счет, категории, описание и вся необходимая информация.
            </p>

            <p>
              Даже спустя годы вы сможете быстро найти нужную запись
              с помощью удобных фильтров.
            </p>

            <div class='feature-list'>
              <div>
                <IconCheck :size='18' />
                Доходы и расходы
              </div>

              <div>
                <IconCheck :size='18' />
                Переводы между счетами
              </div>

              <div>
                <IconCheck :size='18' />
                Гибкие фильтры
              </div>
            </div>
          </div>

          <div class='visual-card transactions-visual'>
            <div class='visual-header'>
              <div>
                <span>Операции</span>
                <strong>Последние записи</strong>
              </div>

              <button class='btn btn-sm btn-primary'>
                + Добавить
              </button>
            </div>

            <div class='operation-row'>
              <div class='operation-icon income'>
                <IconArrowDownRight :size='18' />
              </div>

              <div class='operation-main'>
                <strong>Зарплата</strong>
                <span>Основной счет · Сегодня</span>
              </div>

              <strong class='text-success'>
                +180 000 ₽
              </strong>
            </div>

            <div class='operation-row'>
              <div class='operation-icon'>
                <IconShoppingCart :size='18' />
              </div>

              <div class='operation-main'>
                <strong>Продукты</strong>
                <span>Еда · Сегодня</span>
              </div>

              <strong>
                −4 250 ₽
              </strong>
            </div>

            <div class='operation-row'>
              <div class='operation-icon'>
                <IconCar :size='18' />
              </div>

              <div class='operation-main'>
                <strong>Автомобиль</strong>
                <span>Транспорт · Вчера</span>
              </div>

              <strong>
                −3 500 ₽
              </strong>
            </div>

            <div class='operation-row'>
              <div class='operation-icon income'>
                <IconArrowDownRight :size='18' />
              </div>

              <div class='operation-main'>
                <strong>Возврат</strong>
                <span>Покупки · Вчера</span>
              </div>

              <strong class='text-success'>
                +2 400 ₽
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section class='feature-section section-secondary'>
        <div class='section-layout reverse'>
          <div class='visual-card accounts-visual'>
            <div class='visual-header'>
              <div>
                <span>Финансы</span>
                <strong>Мои счета</strong>
              </div>

              <span class='badge bg-primary-lt'>
                3 счета
              </span>
            </div>

            <div class='account-card active'>
              <div class='account-icon'>
                <IconWallet :size='20' />
              </div>

              <div class='account-info'>
                <strong>Основной счет</strong>
                <span>Банковская карта</span>
              </div>

              <strong>
                284 500 ₽
              </strong>
            </div>

            <div class='account-card'>
              <div class='account-icon'>
                <IconWallet :size='20' />
              </div>

              <div class='account-info'>
                <strong>Накопления</strong>
                <span>Сберегательный счёт</span>
              </div>

              <strong>
                350 000 ₽
              </strong>
            </div>

            <div class='account-card'>
              <div class='account-icon'>
                <IconDeviceMobile :size='20' />
              </div>

              <div class='account-info'>
                <strong>Наличные</strong>
                <span>Кошелёк</span>
              </div>

              <strong>
                50 000 ₽
              </strong>
            </div>
          </div>

          <div class='section-copy'>
            <div class='section-icon'>
              <IconWallet :size='24' />
            </div>

            <span class='section-eyebrow'>
              Счета и категории
            </span>

            <h2>
              Организуйте финансовую систему так, как удобно именно вам
            </h2>

            <p>
              У каждого человека свои привычки и собственный подход
              к ведению бюджета.
            </p>

            <p>
              MyBudget не навязывает готовую схему учета. Вы самостоятельно
              создаете счета с любыми названиями, выбираете валюту,
              добавляете описание и отмечаете самые важные счета как избранные.
            </p>

            <p>
              Категории помогают упорядочить доходы и расходы именно так,
              как удобно вам.
            </p>
          </div>
        </div>
      </section>

      <section class='feature-section'>
        <div class='section-layout'>
          <div class='section-copy'>
            <div class='section-icon'>
              <IconBuilding :size='24' />
            </div>

            <span class='section-eyebrow'>
              Имущество
            </span>

            <h2>
              Следите не только за деньгами, но и за своим капиталом
            </h2>

            <p>
              Личные финансы — это гораздо больше, чем баланс банковской карты.
              Недвижимость, автомобили, земельные участки и другие активы
              также являются важной частью вашего финансового состояния.
            </p>

            <p>
              Для каждого объекта хранится название, тип имущества и его
              текущая стоимость.
            </p>

            <p>
              История изменения цены позволяет увидеть, как менялась
              стоимость актива с течением времени.
            </p>
          </div>

          <div class='visual-card property-visual'>
            <div class='property-header'>
              <div class='property-image'>
                <IconHome :size='32' />
              </div>

              <div>
                <span>Недвижимость</span>
                <strong>Загородный дом</strong>
              </div>
            </div>

            <div class='property-value'>
              <span>Текущая стоимость</span>

              <strong>
                8 500 000 ₽
              </strong>

              <small class='text-success'>
                +14,2% за год
              </small>
            </div>

            <div class='property-chart'>
              <div class='property-line'/>
            </div>

            <div class='property-footer'>
              <span>Август 2025</span>
              <span>Август 2026</span>
            </div>
          </div>
        </div>
      </section>

      <section class='feature-section section-secondary'>
        <div class='section-layout reverse'>
          <div class='visual-card goal-visual'>
            <div class='visual-header'>
              <div>
                <span>Финансовая цель</span>
                <strong>Новый автомобиль</strong>
              </div>

              <div class='goal-icon'>
                <IconCar :size='22' />
              </div>
            </div>

            <div class='goal-amount'>
              <strong>
                420 000 ₽
              </strong>

              <span>
                из 1 200 000 ₽
              </span>
            </div>

            <div class='progress progress-lg'>
              <div
                class='progress-bar'
                style='width: 35%'
              />
            </div>

            <div class='goal-meta'>
              <span>35% накоплено</span>
              <span>780 000 ₽ осталось</span>
            </div>

            <div class='goal-monthly'>
              <span>Необходимо откладывать</span>
              <strong>65 000 ₽ / месяц</strong>
            </div>
          </div>

          <div class='section-copy'>
            <div class='section-icon'>
              <IconTarget :size='24' />
            </div>

            <span class='section-eyebrow'>
              Финансовые цели
            </span>

            <h2>
              Планируйте будущие покупки и накопления
            </h2>

            <p>
              Учет финансов помогает понять настоящее, а финансовые цели
              помогают планировать будущее.
            </p>

            <p>
              Создавайте цели, указывайте сумму, которую хотите накопить,
              и дату, к которой планируете достичь результата.
            </p>

            <p>
              MyBudget автоматически покажет текущий прогресс накоплений
              и рассчитает, сколько необходимо откладывать каждый месяц.
            </p>
          </div>
        </div>
      </section>

      <section class='feature-section'>
        <div class='section-layout'>
          <div class='section-copy'>
            <div class='section-icon'>
              <IconBriefcase :size='24' />
            </div>

            <span class='section-eyebrow'>
              Проекты
            </span>

            <h2>
              Отдельный учет для важных событий
            </h2>

            <p>
              Не все расходы относятся к повседневной жизни. Ремонт квартиры,
              строительство дома, отпуск или любое другое крупное событие
              удобно учитывать отдельно.
            </p>

            <p>
              Проекты позволяют объединять связанные операции в одном месте
              и при необходимости анализировать их отдельно.
            </p>

            <p>
              Так большие задачи не теряются среди ежедневных расходов,
              а становятся самостоятельной частью вашей финансовой истории.
            </p>
          </div>

          <div class='visual-card project-visual'>
            <div class='visual-header'>
              <div>
                <span>Проект</span>
                <strong>Строительство дома</strong>
              </div>

              <span class='badge bg-orange-lt'>
                В процессе
              </span>
            </div>

            <div class='project-total'>
              <span>Потрачено</span>

              <strong>
                2 840 500 ₽
              </strong>
            </div>

            <div class='project-progress'>
              <div
                class='progress'
              >
                <div
                  class='progress-bar bg-orange'
                  style='width: 68%'
                />
              </div>

              <div>
                <span>68% бюджета</span>
                <span>4 200 000 ₽</span>
              </div>
            </div>

            <div class='project-items'>
              <div>
                <span>Материалы</span>
                <strong>1 420 000 ₽</strong>
              </div>

              <div>
                <span>Работы</span>
                <strong>980 500 ₽</strong>
              </div>

              <div>
                <span>Инструменты</span>
                <strong>440 000 ₽</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class='analytics-section section-secondary'>
        <div class='section-heading'>
          <div class='section-icon centered'>
            <IconChartLine :size='24' />
          </div>

          <span class='section-eyebrow'>
            Аналитика
          </span>

          <h2>
            Превращайте данные в понятную картину
          </h2>

          <p>
            Каждая операция, счет, категория, проект и объект имущества
            автоматически становятся частью общей аналитики.
          </p>
        </div>

        <div class='analytics-card'>
          <div class='analytics-header'>
            <div>
              <span>Финансовая динамика</span>

              <strong>
                Баланс за последние 6 месяцев
              </strong>
            </div>

            <div class='btn-group'>
              <button class='btn btn-sm'>
                6 мес.
              </button>

              <button class='btn btn-sm btn-primary'>
                1 год
              </button>

              <button class='btn btn-sm'>
                Всё время
              </button>
            </div>
          </div>

          <div class='analytics-value'>
            <strong>
              684 500 ₽
            </strong>

            <span class='text-success'>
              +18,6%
            </span>
          </div>

          <div class='analytics-chart'>
            <div class='analytics-grid'/>

            <svg
              viewBox='0 0 1000 300'
              preserveAspectRatio='none'
            >
              <defs>
                <linearGradient
                  id='analyticsGradient'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='0%'
                    stop-color='var(--tblr-primary)'
                    stop-opacity='.18'
                  />

                  <stop
                    offset='100%'
                    stop-color='var(--tblr-primary)'
                    stop-opacity='0'
                  />
                </linearGradient>
              </defs>

              <path
                d='M0,250 C70,238 90,248 140,220 C190,190 220,220 270,200 C320,178 350,195 400,160 C450,125 480,155 530,130 C580,104 620,130 670,90 C720,52 760,85 810,62 C860,38 910,58 1000,18 L1000,300 L0,300 Z'
                fill='url(#analyticsGradient)'
              />

              <path
                d='M0,250 C70,238 90,248 140,220 C190,190 220,220 270,200 C320,178 350,195 400,160 C450,125 480,155 530,130 C580,104 620,130 670,90 C720,52 760,85 810,62 C860,38 910,58 1000,18'
                fill='none'
                stroke='var(--tblr-primary)'
                stroke-width='4'
                vector-effect='non-scaling-stroke'
              />
            </svg>
          </div>

          <div class='analytics-labels'>
            <span>Март</span>
            <span>Апрель</span>
            <span>Май</span>
            <span>Июнь</span>
            <span>Июль</span>
            <span>Август</span>
          </div>
        </div>
      </section>

      <section class='cta-section'>
        <div class='cta-glow'/>

        <div class='cta-content'>
          <span class='section-eyebrow'>
            MyBudget
          </span>

          <h2>
            Полная картина ваших финансов
            начинается здесь
          </h2>

          <p>
            От ежедневных расходов до стоимости имущества,
            от финансовых целей до детальной аналитики —
            всё находится в одном месте.
          </p>

          <NuxtLink
            to='/sign_up'
            class='btn btn-primary btn-lg'
          >
            Начать пользоваться
          </NuxtLink>
        </div>
      </section>
    </main>

    <footer class='landing-footer'>
      <div class='footer-content'>
        <div class='footer-brand'>
          <div class='footer-logo'>
            M
          </div>

          <div>
            <strong>MyBudget</strong>
            <span>Домашняя бухгалтерия</span>
          </div>
        </div>

        <div class='footer-links'>
          <NuxtLink to='/sign_in'>
            Вход
          </NuxtLink>

          <NuxtLink to='/sign_up'>
            Регистрация
          </NuxtLink>
        </div>

        <div class='footer-copy'>
          © 2026 MyBudget
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  min-height: 100vh;
  overflow: hidden;
  color: var(--tblr-body-color);
  background: var(--tblr-bg-surface);
}

.hero {
  position: relative;
  padding: 6rem 1.5rem 0;
  overflow: hidden;
  text-align: center;
  background:
    linear-gradient(
      to bottom,
      var(--tblr-bg-surface),
      var(--tblr-bg-surface-secondary)
    );
}

.hero-glow {
  position: absolute;
  top: -300px;
  left: 50%;
  width: 700px;
  height: 700px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: color-mix(
    in srgb,
    var(--tblr-primary) 10%,
    transparent
  );
  filter: blur(90px);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
}

.hero-title {
  max-width: 900px;
  margin: 0 auto;
  font-size: clamp(2.75rem, 6vw, 5rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -.045em;
  color: var(--tblr-heading-color);
}

.hero-title span {
  display: block;
  color: var(--tblr-primary);
}

.hero-description {
  max-width: 680px;
  margin: 1.75rem auto 0;
  font-size: 1.2rem;
  line-height: 1.7;
  color: var(--tblr-secondary);
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: .75rem;
  margin-top: 2rem;
}

.dashboard-preview {
  position: relative;
  z-index: 2;
  max-width: 1100px;
  margin: 5rem auto -1px;
}

.preview-window {
  overflow: hidden;
  border: 1px solid var(--tblr-border-color);
  border-bottom: 0;
  border-radius: 1rem 1rem 0 0;
  background: var(--tblr-bg-surface);
  box-shadow:
    0 30px 80px color-mix(
      in srgb,
      var(--tblr-body-color) 12%,
      transparent
    ),
    0 10px 30px color-mix(
      in srgb,
      var(--tblr-body-color) 6%,
      transparent
    );
  text-align: left;
}

.preview-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 52px;
  padding: 0 1rem;
  border-bottom: 1px solid var(--tblr-border-color);
}

.preview-dots {
  display: flex;
  gap: .35rem;
}

.preview-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--tblr-border-color);
}

.preview-title {
  font-size: .8rem;
  font-weight: 600;
  color: var(--tblr-secondary);
}

.preview-user {
  display: flex;
  justify-content: flex-end;
}

.preview-body {
  display: grid;
  grid-template-columns: 170px 1fr;
  min-height: 480px;
}

.preview-sidebar {
  padding: 1rem;
  border-right: 1px solid var(--tblr-border-color);
  background: var(--tblr-bg-surface-secondary);
}

.preview-logo {
  display: flex;
  align-items: center;
  gap: .5rem;
  margin-bottom: 1.5rem;
  font-size: .85rem;
  font-weight: 600;
}

.preview-logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: .5rem;
  color: var(--tblr-primary-fg);
  background: var(--tblr-primary);
}

.preview-nav-item {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .55rem .65rem;
  margin-bottom: .25rem;
  border-radius: .4rem;
  font-size: .75rem;
  color: var(--tblr-secondary);
}

.preview-nav-item.active {
  color: var(--tblr-primary);
  background: var(--tblr-primary-lt);
}

.preview-main {
  min-width: 0;
  padding: 1.5rem;
}

.preview-page-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.preview-page-title strong {
  display: block;
  margin-top: .2rem;
  font-size: 1.1rem;
}

.preview-muted {
  font-size: .7rem;
  color: var(--tblr-secondary);
}

.preview-date {
  padding: .35rem .6rem;
  border: 1px solid var(--tblr-border-color);
  border-radius: .4rem;
  font-size: .7rem;
  color: var(--tblr-secondary);
}

.preview-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .75rem;
}

.preview-stat {
  padding: 1rem;
  border: 1px solid var(--tblr-border-color);
  border-radius: .6rem;
}

.preview-stat span,
.preview-stat small {
  display: block;
  font-size: .7rem;
  color: var(--tblr-secondary);
}

.preview-stat strong {
  display: block;
  margin: .35rem 0;
  font-size: 1rem;
}

.preview-content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: .75rem;
  margin-top: .75rem;
}

.preview-chart-card,
.preview-transactions {
  min-width: 0;
  padding: 1rem;
  border: 1px solid var(--tblr-border-color);
  border-radius: .6rem;
}

.preview-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: .75rem;
  font-size: .75rem;
  font-weight: 600;
}

.preview-card-muted {
  font-size: .65rem;
  font-weight: 400;
  color: var(--tblr-secondary);
}

.preview-chart {
  position: relative;
  height: 180px;
}

.chart-grid,
.analytics-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
      var(--tblr-border-color) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      var(--tblr-border-color) 1px,
      transparent 1px
    );
  background-size: 25% 25%;
  opacity: .5;
}

.preview-chart svg,
.analytics-chart svg {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-transaction {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: .6rem;
  padding: .65rem 0;
  border-bottom: 1px solid var(--tblr-border-color);
}

.preview-transaction:last-child {
  border-bottom: 0;
}

.transaction-icon,
.operation-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: .5rem;
  background: var(--tblr-bg-surface-secondary);
}

.transaction-icon.income,
.operation-icon.income {
  color: var(--tblr-success);
  background: var(--tblr-success-lt);
}

.transaction-info,
.operation-main {
  min-width: 0;
}

.transaction-info strong,
.transaction-info span {
  display: block;
}

.transaction-info strong {
  font-size: .7rem;
}

.transaction-info span {
  margin-top: .1rem;
  font-size: .6rem;
  color: var(--tblr-secondary);
}

.preview-transaction > strong {
  font-size: .65rem;
  white-space: nowrap;
}

.landing-content {
  max-width: 1200px;
  margin: 0 auto;
}

.features-section {
  padding: 7rem 1.5rem;
}

.section-heading {
  max-width: 760px;
  margin: 0 auto 3rem;
  text-align: center;
}

.section-eyebrow {
  display: block;
  margin-bottom: .75rem;
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--tblr-primary);
}

.section-heading h2,
.section-copy h2,
.cta-content h2 {
  margin: 0;
  color: var(--tblr-heading-color);
  font-weight: 650;
  line-height: 1.2;
  letter-spacing: -.025em;
}

.section-heading h2 {
  font-size: clamp(2rem, 4vw, 3rem);
}

.section-heading p {
  max-width: 650px;
  margin: 1rem auto 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--tblr-secondary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.feature-card {
  padding: 1.75rem;
  border: 1px solid var(--tblr-border-color);
  border-radius: .85rem;
  background: var(--tblr-bg-surface);
  transition:
    transform .2s ease,
    box-shadow .2s ease,
    border-color .2s ease;
}

.feature-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(
    in srgb,
    var(--tblr-primary) 35%,
    var(--tblr-border-color)
  );
  box-shadow: 0 12px 30px color-mix(
    in srgb,
    var(--tblr-body-color) 6%,
    transparent
  );
}

.feature-icon,
.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: 1.25rem;
  border-radius: .75rem;
  color: var(--tblr-primary);
  background: var(--tblr-primary-lt);
}

.feature-card h3 {
  margin: 0 0 .5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--tblr-heading-color);
}

.feature-card p {
  margin: 0;
  font-size: .9rem;
  line-height: 1.65;
  color: var(--tblr-secondary);
}

.feature-section {
  padding: 7rem 1.5rem;
}

.section-secondary {
  max-width: none;
  margin-right: calc((1200px - 100vw) / 2);
  margin-left: calc((1200px - 100vw) / 2);
  padding-right: max(1.5rem, calc((100vw - 1200px) / 2 + 1.5rem));
  padding-left: max(1.5rem, calc((100vw - 1200px) / 2 + 1.5rem));
  background: var(--tblr-bg-surface-secondary);
}

.section-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 5rem;
  max-width: 1100px;
  margin: 0 auto;
}

.section-layout.reverse > :first-child {
  order: 2;
}

.section-layout.reverse > :last-child {
  order: 1;
}

.section-copy {
  max-width: 540px;
}

.section-copy .section-icon {
  margin-bottom: 1.5rem;
}

.section-copy h2 {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
}

.section-copy p {
  margin: 1rem 0 0;
  font-size: 1rem;
  line-height: 1.75;
  color: var(--tblr-secondary);
}

.feature-list {
  display: grid;
  gap: .65rem;
  margin-top: 1.5rem;
}

.feature-list div {
  display: flex;
  align-items: center;
  gap: .6rem;
  font-size: .9rem;
  font-weight: 500;
  color: var(--tblr-body-color);
}

.feature-list svg {
  color: var(--tblr-success);
}

.visual-card {
  padding: 1.5rem;
  border: 1px solid var(--tblr-border-color);
  border-radius: 1rem;
  background: var(--tblr-bg-surface);
  box-shadow: 0 15px 40px color-mix(
    in srgb,
    var(--tblr-body-color) 5%,
    transparent
  );
}

.visual-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.visual-header > div:first-child span,
.property-header span {
  display: block;
  margin-bottom: .2rem;
  font-size: .7rem;
  color: var(--tblr-secondary);
}

.visual-header strong,
.property-header strong {
  display: block;
  color: var(--tblr-heading-color);
}

.operation-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: .75rem;
  padding: .9rem 0;
  border-bottom: 1px solid var(--tblr-border-color);
}

.operation-row:last-child {
  border-bottom: 0;
}

.operation-main strong,
.operation-main span {
  display: block;
}

.operation-main strong {
  font-size: .85rem;
}

.operation-main span {
  margin-top: .15rem;
  font-size: .7rem;
  color: var(--tblr-secondary);
}

.operation-row > strong {
  font-size: .8rem;
  white-space: nowrap;
}

.account-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: .75rem;
  padding: 1rem;
  margin-top: .65rem;
  border: 1px solid var(--tblr-border-color);
  border-radius: .65rem;
}

.account-card.active {
  border-color: color-mix(
    in srgb,
    var(--tblr-primary) 35%,
    var(--tblr-border-color)
  );
  background: var(--tblr-primary-lt);
}

.account-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: .6rem;
  color: var(--tblr-primary);
  background: var(--tblr-bg-surface);
}

.account-info strong,
.account-info span {
  display: block;
}

.account-info strong {
  font-size: .85rem;
}

.account-info span {
  margin-top: .15rem;
  font-size: .7rem;
  color: var(--tblr-secondary);
}

.account-card > strong {
  font-size: .8rem;
  white-space: nowrap;
}

.property-header {
  display: flex;
  align-items: center;
  gap: .75rem;
}

.property-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: .75rem;
  color: var(--tblr-primary);
  background: var(--tblr-primary-lt);
}

.property-value {
  margin-top: 2rem;
}

.property-value span,
.property-value small {
  display: block;
  font-size: .75rem;
  color: var(--tblr-secondary);
}

.property-value strong {
  display: block;
  margin: .25rem 0;
  font-size: 2rem;
  color: var(--tblr-heading-color);
}

.property-chart {
  position: relative;
  height: 100px;
  margin-top: 1.5rem;
  overflow: hidden;
}

.property-chart::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
    var(--tblr-border-color) 1px,
    transparent 1px
  );
  background-size: 100% 25px;
  opacity: .6;
}

.property-line {
  position: absolute;
  right: 0;
  bottom: 15px;
  left: 0;
  height: 70px;
  border-top: 3px solid var(--tblr-primary);
  transform: skewY(-8deg);
}

.property-footer {
  display: flex;
  justify-content: space-between;
  margin-top: .5rem;
  font-size: .65rem;
  color: var(--tblr-secondary);
}

.goal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: .6rem;
  color: var(--tblr-primary);
  background: var(--tblr-primary-lt);
}

.goal-amount {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin: 2rem 0 .75rem;
}

.goal-amount strong {
  font-size: 1.7rem;
  color: var(--tblr-heading-color);
}

.goal-amount span {
  font-size: .75rem;
  color: var(--tblr-secondary);
}

.goal-meta {
  display: flex;
  justify-content: space-between;
  margin-top: .5rem;
  font-size: .7rem;
  color: var(--tblr-secondary);
}

.goal-monthly {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: .65rem;
  background: var(--tblr-bg-surface-secondary);
}

.goal-monthly span {
  font-size: .75rem;
  color: var(--tblr-secondary);
}

.goal-monthly strong {
  font-size: .8rem;
}

.project-total {
  margin: 2rem 0 1.25rem;
}

.project-total span {
  display: block;
  font-size: .75rem;
  color: var(--tblr-secondary);
}

.project-total strong {
  display: block;
  margin-top: .25rem;
  font-size: 2rem;
  color: var(--tblr-heading-color);
}

.project-progress .progress {
  height: .65rem;
}

.project-progress > div:last-child {
  display: flex;
  justify-content: space-between;
  margin-top: .5rem;
  font-size: .7rem;
  color: var(--tblr-secondary);
}

.project-items {
  display: grid;
  gap: .65rem;
  margin-top: 1.5rem;
}

.project-items div {
  display: flex;
  justify-content: space-between;
  padding-bottom: .65rem;
  border-bottom: 1px solid var(--tblr-border-color);
  font-size: .8rem;
}

.project-items span {
  color: var(--tblr-secondary);
}

.analytics-section {
  max-width: none;
  margin-right: calc((1200px - 100vw) / 2);
  margin-left: calc((1200px - 100vw) / 2);
  padding-top: 7rem;
  padding-right: max(1.5rem, calc((100vw - 1200px) / 2 + 1.5rem));
  padding-bottom: 7rem;
  padding-left: max(1.5rem, calc((100vw - 1200px) / 2 + 1.5rem));
  background: var(--tblr-bg-surface-secondary);
}

.section-icon.centered {
  margin-right: auto;
  margin-left: auto;
}

.analytics-card {
  max-width: 1000px;
  margin: 3rem auto 0;
  padding: 1.5rem;
  border: 1px solid var(--tblr-border-color);
  border-radius: 1rem;
  background: var(--tblr-bg-surface);
  box-shadow: 0 20px 50px color-mix(
    in srgb,
    var(--tblr-body-color) 5%,
    transparent
  );
}

.analytics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.analytics-header span,
.analytics-header strong {
  display: block;
}

.analytics-header span {
  font-size: .7rem;
  color: var(--tblr-secondary);
}

.analytics-header strong {
  margin-top: .2rem;
  color: var(--tblr-heading-color);
}

.analytics-value {
  display: flex;
  align-items: center;
  gap: .75rem;
  margin-top: 2rem;
}

.analytics-value strong {
  font-size: 2rem;
  color: var(--tblr-heading-color);
}

.analytics-value span {
  font-size: .8rem;
  font-weight: 600;
}

.analytics-chart {
  position: relative;
  height: 280px;
  margin-top: 1rem;
}

.analytics-labels {
  display: flex;
  justify-content: space-between;
  margin-top: .5rem;
  font-size: .65rem;
  color: var(--tblr-secondary);
}

.cta-section {
  position: relative;
  max-width: none;
  margin-right: calc((1200px - 100vw) / 2);
  margin-left: calc((1200px - 100vw) / 2);
  padding: 8rem 1.5rem;
  overflow: hidden;
  text-align: center;
  background: var(--tblr-bg-surface);
}

.cta-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 600px;
  height: 350px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: color-mix(
    in srgb,
    var(--tblr-primary) 8%,
    transparent
  );
  filter: blur(80px);
}

.cta-content {
  position: relative;
  z-index: 1;
  max-width: 760px;
  margin: 0 auto;
}

.cta-content h2 {
  font-size: clamp(2rem, 4vw, 3rem);
}

.cta-content p {
  max-width: 620px;
  margin: 1.25rem auto 2rem;
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--tblr-secondary);
}

.landing-footer {
  border-top: 1px solid var(--tblr-border-color);
  background: var(--tblr-bg-surface-secondary);
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: .75rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: .6rem;
  font-weight: 700;
  color: var(--tblr-primary-fg);
  background: var(--tblr-primary);
}

.footer-brand strong,
.footer-brand span {
  display: block;
}

.footer-brand strong {
  font-size: .85rem;
}

.footer-brand span {
  margin-top: .1rem;
  font-size: .7rem;
  color: var(--tblr-secondary);
}

.footer-links {
  display: flex;
  gap: 1.25rem;
  margin-left: auto;
}

.footer-links a {
  font-size: .8rem;
  color: var(--tblr-secondary);
  text-decoration: none;
}

.footer-links a:hover {
  color: var(--tblr-primary);
}

.footer-copy {
  font-size: .75rem;
  color: var(--tblr-secondary);
}

@media (max-width: 991.98px) {
  .hero {
    padding-top: 4rem;
  }

  .dashboard-preview {
    margin-top: 3rem;
  }

  .preview-sidebar {
    display: none;
  }

  .preview-body {
    display: block;
    min-height: auto;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-layout {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .section-layout.reverse > :first-child,
  .section-layout.reverse > :last-child {
    order: initial;
  }

  .section-copy {
    max-width: none;
  }

  .visual-card {
    max-width: 650px;
    width: 100%;
    margin: 0 auto;
  }
}

@media (max-width: 767.98px) {
  .landing {
    width: 100%;
    overflow-x: hidden;
  }

  /* Hero */

  .hero {
    padding: 2.5rem 1rem 0;
  }

  .hero-glow {
    top: -220px;
    width: 500px;
    height: 500px;
    filter: blur(70px);
  }

  .hero-title {
    max-width: 100%;
    font-size: 2.35rem;
    line-height: 1.08;
    letter-spacing: -.04em;
  }

  .hero-description {
    max-width: 340px;
    margin-top: 1.25rem;
    font-size: .95rem;
    line-height: 1.6;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
    gap: .6rem;
    width: 100%;
    max-width: 340px;
    margin: 1.5rem auto 0;
  }

  .hero-actions .btn {
    width: 100%;
  }

  /* Dashboard preview */

  .dashboard-preview {
    width: calc(100% + 1rem);
    margin-top: 2.25rem;
    margin-left: -.5rem;
  }

  .preview-window {
    border-radius: .85rem .85rem 0 0;
    box-shadow:
      0 20px 50px color-mix(
        in srgb,
        var(--tblr-body-color) 10%,
        transparent
      ),
      0 8px 20px color-mix(
        in srgb,
        var(--tblr-body-color) 5%,
        transparent
      );
  }

  .preview-header {
    height: 44px;
    padding: 0 .75rem;
  }

  .preview-dots span {
    width: 6px;
    height: 6px;
  }

  .preview-title {
    font-size: .7rem;
  }

  .preview-user .avatar {
    width: 24px;
    height: 24px;
    font-size: .65rem;
  }

  .preview-main {
    padding: .75rem;
  }

  .preview-page-title {
    margin-bottom: .75rem;
  }

  .preview-page-title strong {
    font-size: .9rem;
  }

  .preview-muted {
    font-size: .6rem;
  }

  .preview-date {
    padding: .25rem .45rem;
    font-size: .6rem;
  }

  .preview-stats {
    grid-template-columns: 1fr 1fr;
    gap: .5rem;
  }

  .preview-stat {
    padding: .7rem;
  }

  .preview-stat:first-child {
    grid-column: 1 / -1;
  }

  .preview-stat span,
  .preview-stat small {
    font-size: .6rem;
  }

  .preview-stat strong {
    margin: .25rem 0;
    font-size: .9rem;
  }

  .preview-content-grid {
    grid-template-columns: 1fr;
    gap: .5rem;
    margin-top: .5rem;
  }

  .preview-chart-card {
    padding: .75rem;
  }

  .preview-transactions {
    display: none;
  }

  .preview-chart {
    height: 130px;
  }

  .preview-card-header {
    margin-bottom: .5rem;
    font-size: .65rem;
  }

  /* Main sections */

  .features-section,
  .feature-section,
  .analytics-section {
    padding-top: 4rem;
    padding-bottom: 4rem;
  }

  .features-section {
    padding-right: 1rem;
    padding-left: 1rem;
  }

  .section-heading {
    margin-bottom: 2rem;
  }

  .section-eyebrow {
    margin-bottom: .6rem;
    font-size: .65rem;
  }

  .section-heading h2 {
    font-size: 1.85rem;
    line-height: 1.2;
  }

  .section-heading p {
    margin-top: .8rem;
    font-size: .9rem;
    line-height: 1.6;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: .75rem;
  }

  .feature-card {
    padding: 1.25rem;
    border-radius: .75rem;
  }

  .feature-icon {
    width: 42px;
    height: 42px;
    margin-bottom: 1rem;
    border-radius: .65rem;
  }

  .feature-card h3 {
    margin-bottom: .4rem;
  }

  .feature-card p {
    font-size: .85rem;
    line-height: 1.6;
  }

  /* Feature sections */

  .feature-section {
    padding-right: 1rem;
    padding-left: 1rem;
  }

  .section-secondary {
    margin-right: calc((100vw - 100%) / -2);
    margin-left: calc((100vw - 100%) / -2);
    padding-right: 1rem;
    padding-left: 1rem;
  }

  .section-layout {
    gap: 2rem;
  }

  .section-copy h2 {
    font-size: 1.7rem;
    line-height: 1.22;
  }

  .section-copy p {
    margin-top: .85rem;
    font-size: .9rem;
    line-height: 1.65;
  }

  .section-copy .section-icon {
    width: 44px;
    height: 44px;
    margin-bottom: 1.1rem;
  }

  .feature-list {
    gap: .55rem;
    margin-top: 1.25rem;
  }

  .feature-list div {
    font-size: .85rem;
  }

  /* Visual cards */

  .visual-card {
    padding: 1rem;
    border-radius: .8rem;
  }

  .visual-header {
    gap: .75rem;
    margin-bottom: 1rem;
  }

  .visual-header > div:first-child span,
  .property-header span {
    font-size: .65rem;
  }

  .visual-header strong,
  .property-header strong {
    font-size: .85rem;
  }

  /* Operations */

  .operation-row {
    grid-template-columns: auto 1fr;
    gap: .65rem;
    padding: .8rem 0;
  }

  .operation-main strong {
    font-size: .8rem;
  }

  .operation-main span {
    font-size: .65rem;
  }

  .operation-row > strong {
    grid-column: 2;
    font-size: .75rem;
  }

  /* Accounts */

  .account-card {
    grid-template-columns: auto 1fr;
    gap: .65rem;
    padding: .8rem;
  }

  .account-icon {
    width: 34px;
    height: 34px;
  }

  .account-info strong {
    font-size: .8rem;
  }

  .account-info span {
    font-size: .65rem;
  }

  .account-card > strong {
    grid-column: 2;
    font-size: .75rem;
  }

  /* Property */

  .property-image {
    width: 52px;
    height: 52px;
  }

  .property-value {
    margin-top: 1.5rem;
  }

  .property-value strong {
    font-size: 1.7rem;
  }

  .property-chart {
    height: 80px;
    margin-top: 1.25rem;
  }

  /* Goals */

  .goal-amount {
    align-items: flex-start;
    flex-direction: column;
    gap: .25rem;
    margin: 1.5rem 0 .75rem;
  }

  .goal-amount strong {
    font-size: 1.5rem;
  }

  .goal-meta {
    gap: .5rem;
    font-size: .65rem;
  }

  .goal-monthly {
    align-items: flex-start;
    flex-direction: column;
    gap: .4rem;
    margin-top: 1.25rem;
    padding: .8rem;
  }

  /* Projects */

  .project-total {
    margin: 1.5rem 0 1rem;
  }

  .project-total strong {
    font-size: 1.7rem;
  }

  .project-items {
    margin-top: 1.25rem;
  }

  .project-items div {
    font-size: .75rem;
  }

  /* Analytics */

  .analytics-section {
    padding-right: 1rem;
    padding-left: 1rem;
  }

  .analytics-card {
    margin-top: 2rem;
    padding: 1rem;
    border-radius: .8rem;
  }

  .analytics-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .analytics-header strong {
    font-size: .85rem;
  }

  .analytics-header .btn-group {
    width: 100%;
  }

  .analytics-header .btn-group .btn {
    flex: 1;
    padding-right: .5rem;
    padding-left: .5rem;
    font-size: .7rem;
  }

  .analytics-value {
    margin-top: 1.5rem;
  }

  .analytics-value strong {
    font-size: 1.7rem;
  }

  .analytics-value span {
    font-size: .7rem;
  }

  .analytics-chart {
    height: 180px;
    margin-top: .75rem;
  }

  .analytics-labels {
    font-size: .6rem;
  }

  /* CTA */

  .cta-section {
    width: 100%;
    margin-right: 0;
    margin-left: 0;
    padding: 5rem 1rem;
  }

  .cta-content {
    width: 100%;
    max-width: 100%;
  }

  .cta-content h2 {
    font-size: 1.9rem;
    line-height: 1.2;
  }

  .cta-content p {
    max-width: 340px;
    margin: 1rem auto 1.5rem;
    font-size: .9rem;
    line-height: 1.6;
  }

  .cta-content .btn {
    width: 100%;
    max-width: 340px;
  }

  .cta-glow {
    width: 450px;
    height: 280px;
  }

  /* Footer */

  .footer-content {
    align-items: flex-start;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.5rem 1rem;
  }

  .footer-links {
    flex-wrap: wrap;
    gap: 1rem;
    margin-left: 0;
  }

  .footer-copy {
    width: auto;
    font-size: .7rem;
  }
}
</style>