package database

import (
	"starwars-api/models"
	"log"
)

// SeedQuizQuestions додає початкові питання для вікторини
func SeedQuizQuestions() {
	// Перевіряємо, чи вже є питання
	var count int64
	DB.Model(&models.QuizQuestion{}).Count(&count)
	if count > 0 {
		log.Println("Quiz questions already exist, skipping seed")
		return
	}

	questions := []models.QuizQuestion{
		// CHARACTERS QUESTIONS
		{
			Category:      "characters",
			Question:      "Хто є батьком Люка Скайвокера?",
			CorrectAnswer: "Дарт Вейдер",
			Difficulty:    1,
			Points:        10,
			Hint:          "Він носить чорну маску та дихає важко",
			Explanation:   "Дарт Вейдер (Енакін Скайвокер) є батьком Люка Скайвокера",
		},
		{
			Category:      "characters",
			Question:      "Як звати зеленого майстра Джедая з великими вухами?",
			CorrectAnswer: "Йода",
			Difficulty:    1,
			Points:        10,
			Hint:          "Він говорить у незвичайному порядку слів",
			Explanation:   "Майстер Йода - один з найпотужніших Джедаїв в історії",
		},
		{
			Category:      "characters",
			Question:      "Хто вбив Хана Соло?",
			CorrectAnswer: "Кайло Рен",
			Difficulty:    2,
			Points:        15,
			Hint:          "Це був його власний син",
			Explanation:   "Кайло Рен (Бен Соло) вбив свого батька Хана Соло на планеті Старкіллер",
		},
		{
			Category:      "characters",
			Question:      "Як звати дроїда-астромеханіка Люка Скайвокера?",
			CorrectAnswer: "R2-D2",
			Difficulty:    1,
			Points:        10,
			Hint:          "Він синьо-білого кольору та видає звуки",
			Explanation:   "R2-D2 - вірний дроїд-компаньон Люка Скайвокера",
		},
		{
			Category:      "characters",
			Question:      "Хто навчав Оби-Вана Кенобі?",
			CorrectAnswer: "Квай-Гон Джинн",
			Difficulty:    2,
			Points:        15,
			Hint:          "Він загинув у битві з Дартом Молом",
			Explanation:   "Квай-Гон Джинн був майстром Оби-Вана Кенобі",
		},

		// PLANETS QUESTIONS
		{
			Category:      "planets",
			Question:      "На якій планеті народився Люк Скайвокер?",
			CorrectAnswer: "Татуїн",
			Difficulty:    1,
			Points:        10,
			Hint:          "Пустельна планета з двома сонцями",
			Explanation:   "Татуїн - пустельна планета, де виріс Люк Скайвокер",
		},
		{
			Category:      "planets",
			Question:      "Як називається лісова планета, де живуть Евоки?",
			CorrectAnswer: "Ендор",
			Difficulty:    2,
			Points:        15,
			Hint:          "Маленькі пухнасті істоти допомогли Повстанцям",
			Explanation:   "Ендор - лісова планета, домівка Евоків",
		},
		{
			Category:      "planets",
			Question:      "Яка планета була знищена Зіркою Смерті?",
			CorrectAnswer: "Альдераан",
			Difficulty:    2,
			Points:        15,
			Hint:          "Це була домівка принцеси Леї",
			Explanation:   "Альдераан був знищений Зіркою Смерті як демонстрація сили",
		},
		{
			Category:      "planets",
			Question:      "На якій планеті знаходиться храм Джедаїв?",
			CorrectAnswer: "Корусант",
			Difficulty:    2,
			Points:        15,
			Hint:          "Столиця Галактичної Республіки",
			Explanation:   "Корусант - планета-місто, столиця Республіки та Імперії",
		},

		// STARSHIPS QUESTIONS
		{
			Category:      "starships",
			Question:      "Як називається корабель Хана Соло?",
			CorrectAnswer: "Тисячолітній Сокіл",
			Difficulty:    1,
			Points:        10,
			Hint:          "Найшвидший корабель у галактиці",
			Explanation:   "Тисячолітній Сокіл - легендарний корабель Хана Соло",
		},
		{
			Category:      "starships",
			Question:      "Як називається флагманський корабель Дарта Вейдера?",
			CorrectAnswer: "Екзекутор",
			Difficulty:    3,
			Points:        20,
			Hint:          "Супер Зоряний Руйнівник",
			Explanation:   "Екзекутор - величезний Супер Зоряний Руйнівник Дарта Вейдера",
		},
		{
			Category:      "starships",
			Question:      "Який тип винищувача пілотував Люк Скайвокер у битві біля Ямвіна?",
			CorrectAnswer: "X-wing",
			Difficulty:    2,
			Points:        15,
			Hint:          "Крила розкриваються у формі літери X",
			Explanation:   "X-wing - основний винищувач Альянсу Повстанців",
		},

		// ORGANIZATIONS QUESTIONS
		{
			Category:      "organizations",
			Question:      "Як називається орден воїнів Світла?",
			CorrectAnswer: "Джедаї",
			Difficulty:    1,
			Points:        10,
			Hint:          "Вони використовують світлові мечі",
			Explanation:   "Джедаї - орден воїнів, що служать Світлій стороні Сили",
		},
		{
			Category:      "organizations",
			Question:      "Хто очолював Галактичну Імперію?",
			CorrectAnswer: "Імператор Палпатін",
			Difficulty:    1,
			Points:        10,
			Hint:          "Він також відомий як Дарт Сідіус",
			Explanation:   "Імператор Палпатін правив Галактичною Імперією",
		},
		{
			Category:      "organizations",
			Question:      "Як називається організація, що протистояла Імперії?",
			CorrectAnswer: "Альянс Повстанців",
			Difficulty:    1,
			Points:        10,
			Hint:          "Вони боролися за свободу галактики",
			Explanation:   "Альянс Повстанців боровся проти тиранії Імперії",
		},

		// WEAPONS QUESTIONS
		{
			Category:      "weapons",
			Question:      "Як називається зброя Джедаїв?",
			CorrectAnswer: "Світловий меч",
			Difficulty:    1,
			Points:        10,
			Hint:          "Енергетичний клинок різних кольорів",
			Explanation:   "Світловий меч - традиційна зброя Джедаїв та Ситхів",
		},
		{
			Category:      "weapons",
			Question:      "Якого кольору був світловий меч Мейса Вінду?",
			CorrectAnswer: "Фіолетовий",
			Difficulty:    3,
			Points:        20,
			Hint:          "Унікальний колір серед Джедаїв",
			Explanation:   "Мейс Вінду мав рідкісний фіолетовий світловий меч",
		},

		// FILMS QUESTIONS
		{
			Category:      "films",
			Question:      "Який фільм Star Wars вийшов першим?",
			CorrectAnswer: "Епізод IV: Нова надія",
			Difficulty:    2,
			Points:        15,
			Hint:          "1977 рік, режисер Джордж Лукас",
			Explanation:   "Епізод IV був першим випущеним фільмом саги",
		},
		{
			Category:      "films",
			Question:      "У якому епізоді Енакін стає Дартом Вейдером?",
			CorrectAnswer: "Епізод III: Помста Ситхів",
			Difficulty:    2,
			Points:        15,
			Hint:          "Останній фільм трилогії приквелів",
			Explanation:   "В Епізоді III Енакін остаточно переходить на Темну сторону",
		},
	}

	// Додаємо неправильні відповіді для кожного питання
	wrongAnswersData := [][]string{
		{"Оби-Ван Кенобі", "Хан Соло", "Імператор Палпатін"},
		{"Мейс Вінду", "Оби-Ван Кенобі", "Квай-Гон Джинн"},
		{"Дарт Вейдер", "Імператор Палпатін", "Снок"},
		{"C-3PO", "BB-8", "R5-D4"},
		{"Йода", "Мейс Вінду", "Кі-Аді-Мунді"},
		{"Набу", "Корусант", "Хот"},
		{"Дагоба", "Набу", "Кашиїк"},
		{"Набу", "Корусант", "Татуїн"},
		{"Набу", "Татуїн", "Хот"},
		{"Зірка Смерті", "Раб I", "Імперський шатл"},
		{"Зоряний Руйнівник", "Супер Зоряний Руйнівник", "Дредноут"},
		{"TIE Fighter", "A-wing", "Y-wing"},
		{"Ситхи", "Мандалорці", "Клони"},
		{"Дарт Вейдер", "Гранд Мофф Таркін", "Дарт Мол"},
		{"Перший Орден", "Галактична Республіка", "Сепаратисти"},
		{"Бластер", "Вібро-меч", "Електропосох"},
		{"Синій", "Червоний", "Зелений"},
		{"Епізод I: Прихована загроза", "Епізод V: Імперія завдає удару у відповідь", "Епізод VI: Повернення Джедая"},
		{"Епізод II: Атака клонів", "Епізод I: Прихована загроза", "Епізод IV: Нова надія"},
	}

	// Встановлюємо неправильні відповіді
	for i, question := range questions {
		if i < len(wrongAnswersData) {
			question.SetWrongAnswersArray(wrongAnswersData[i])
		}
		questions[i] = question
	}

	// Зберігаємо питання в базу даних
	for _, question := range questions {
		if err := DB.Create(&question).Error; err != nil {
			log.Printf("Error creating question: %v", err)
		}
	}

	log.Printf("✅ Successfully seeded %d quiz questions", len(questions))
}
