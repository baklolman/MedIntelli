// =============================================
// MySymptoms — COMPLETE DIAGNOSIS QUIZ QUESTION BANK
// All 9 categories, 8 questions each
// =============================================

const quizCategories = [
    { id: 'fever_flu', title: 'Fever & Flu', icon: 'ri-thermometer-fill', color: '#f59e0b' },
    { id: 'stomach_gut', title: 'Stomach & Gut', icon: 'ri-restaurant-line', color: '#10b981' },
    { id: 'head_neuro', title: 'Head & Neuro', icon: 'ri-brain-line', color: '#8b5cf6' },
    { id: 'skin_rashes', title: 'Skin & Rashes', icon: 'ri-drop-fill', color: '#ec4899' },
    { id: 'breathing_chest', title: 'Breathing & Chest', icon: 'ri-lungs-line', color: '#3b82f6' },
    { id: 'muscles_joints', title: 'Muscles & Joints', icon: 'ri-walk-line', color: '#f97316' },
    { id: 'ent', title: 'Eye, Ear, Nose & Throat', icon: 'ri-ear-line', color: '#14b8a6' },
    { id: 'womens_health', title: "Women's Health", icon: 'ri-women-line', color: '#e879f9' },
    { id: 'mens_health', title: "Men's Health", icon: 'ri-men-line', color: '#6366f1' }
];

const quizQuestions = {

    // ─────────────────────────────────────────────
    // 1. FEVER & FLU (already written — kept as-is)
    // ─────────────────────────────────────────────
    fever_flu: [
        {
            text: "How high is your body temperature?",
            options: [
                { text: "Normal (No fever)", weights: { "Common Cold": 1, "Allergies": 2 } },
                { text: "Slightly elevated (99–100.4°F / 37.2–38°C)", weights: { "Common Cold": 3, "Mild Viral Infection": 3 } },
                { text: "High (100.5–103°F / 38.1–39.4°C)", weights: { "Flu (Influenza)": 3, "COVID-19": 2, "Bacterial Infection": 2 } },
                { text: "Very high (>103°F / >39.4°C)", weights: { "Severe Infection": 4, "Flu (Influenza)": 2, "Dengue/Malaria": 3 }, redFlag: true }
            ]
        },
        {
            text: "How long have you had the fever?",
            options: [
                { text: "Less than 24 hours", weights: { "Mild Viral Infection": 1 } },
                { text: "1 to 3 days", weights: { "Flu (Influenza)": 2, "Common Cold": 1 } },
                { text: "4 to 7 days", weights: { "COVID-19": 2, "Bacterial Infection": 2 } },
                { text: "More than a week", weights: { "Chronic Infection": 3, "Typhoid/Malaria": 3 }, redFlag: true }
            ]
        },
        {
            text: "Are you experiencing a cough?",
            options: [
                { text: "No cough", weights: { "Mild Viral Infection": 1 } },
                { text: "Mild, dry cough", weights: { "Common Cold": 2, "Allergies": 1 } },
                { text: "Severe, dry cough", weights: { "COVID-19": 3, "Flu (Influenza)": 2 } },
                { text: "Wet cough with mucus", weights: { "Bronchitis": 3, "Pneumonia": 2, "Bacterial Infection": 2 } }
            ]
        },
        {
            text: "Are you experiencing body aches, chills, or sweats?",
            options: [
                { text: "None", weights: { "Common Cold": 1 } },
                { text: "Mild aches", weights: { "Common Cold": 2, "Mild Viral Infection": 1 } },
                { text: "Severe body aches and chills", weights: { "Flu (Influenza)": 4, "COVID-19": 2 } },
                { text: "Alternating chills and drenching sweats", weights: { "Malaria/Dengue": 4, "Severe Bacterial Infection": 3 } }
            ]
        },
        {
            text: "Do you have a sore throat?",
            options: [
                { text: "No", weights: {} },
                { text: "Scratchy, mild pain", weights: { "Common Cold": 2, "Allergies": 1 } },
                { text: "Very painful, swallowing hurts", weights: { "Strep Throat": 4, "Tonsillitis": 3 } },
                { text: "Painful, accompanied by hoarseness", weights: { "Laryngitis": 3, "COVID-19": 1 } }
            ]
        },
        {
            text: "Are you experiencing any shortness of breath?",
            options: [
                { text: "No", weights: { "Common Cold": 1, "Flu (Influenza)": 1 } },
                { text: "Only with exertion", weights: { "Bronchitis": 2, "COVID-19": 2 } },
                { text: "Yes, even while resting", weights: { "Pneumonia": 4, "Severe COVID-19": 4, "Asthma Exacerbation": 3 }, redFlag: true },
                { text: "Gasping for air or chest tightness", weights: { "Medical Emergency": 5 }, redFlag: true }
            ]
        },
        {
            text: "Have you noticed a new loss of taste or smell?",
            options: [
                { text: "No", weights: { "Common Cold": 1, "Flu (Influenza)": 1 } },
                { text: "Slightly diminished (stuffy nose)", weights: { "Common Cold": 2, "Sinusitis": 2 } },
                { text: "Complete loss of taste or smell", weights: { "COVID-19": 5 } },
                { text: "Everything smells/tastes foul", weights: { "Sinus Infection": 3 } }
            ]
        },
        {
            text: "How would you describe your energy levels?",
            options: [
                { text: "Normal, can go about my day", weights: { "Common Cold": 2 } },
                { text: "Tired, need to rest", weights: { "Mild Viral Infection": 2 } },
                { text: "Exhausted, staying in bed", weights: { "Flu (Influenza)": 3, "COVID-19": 2 } },
                { text: "Profound weakness, dizzy when standing", weights: { "Severe Dehydration": 4, "Severe Infection": 3 }, redFlag: true }
            ]
        }
    ],

    // ─────────────────────────────────────────────
    // 2. STOMACH & GUT (already written — kept as-is)
    // ─────────────────────────────────────────────
    stomach_gut: [
        {
            text: "What is your primary symptom?",
            options: [
                { text: "Nausea and Vomiting", weights: { "Gastroenteritis (Stomach Bug)": 3, "Food Poisoning": 3 } },
                { text: "Diarrhea", weights: { "Gastroenteritis (Stomach Bug)": 3, "Irritable Bowel Syndrome (IBS)": 2 } },
                { text: "Constipation", weights: { "Constipation": 4, "Dietary Issue": 2 } },
                { text: "General abdominal pain/cramps", weights: { "Indigestion": 2, "Gas/Bloating": 2 } }
            ]
        },
        {
            text: "If you have pain, where is it mainly located?",
            options: [
                { text: "Upper abdomen / Below ribs", weights: { "Acid Reflux / GERD": 3, "Gallbladder Issue": 2, "Ulcer": 2 } },
                { text: "Lower right side", weights: { "Appendicitis": 5, "Ovarian Cyst": 2 }, redFlag: true },
                { text: "Lower abdomen / widespread cramps", weights: { "Gastroenteritis (Stomach Bug)": 2, "IBS": 2 } },
                { text: "I don't have abdominal pain", weights: {} }
            ]
        },
        {
            text: "How long have you been experiencing these symptoms?",
            options: [
                { text: "Just started today (<24h)", weights: { "Food Poisoning": 3, "Gastroenteritis (Stomach Bug)": 2 } },
                { text: "A few days (2–5 days)", weights: { "Gastroenteritis (Stomach Bug)": 2, "Viral Infection": 2 } },
                { text: "A week or two", weights: { "Bacterial Gut Infection": 3, "Parasite": 2 } },
                { text: "On and off for months/years", weights: { "Irritable Bowel Syndrome (IBS)": 4, "GERD": 3, "Inflammatory Bowel Disease": 3 } }
            ]
        },
        {
            text: "Are you able to keep liquids down?",
            options: [
                { text: "Yes, eating and drinking fine", weights: { "Mild Indigestion": 1 } },
                { text: "Only water/clear liquids", weights: { "Gastroenteritis (Stomach Bug)": 2, "Food Poisoning": 2 } },
                { text: "No, vomiting everything immediately", weights: { "Severe Gastroenteritis": 3, "Dehydration Risk": 4 }, redFlag: true },
                { text: "Not vomiting, just no appetite", weights: { "Viral Infection": 1 } }
            ]
        },
        {
            text: "Have you noticed any blood in your vomit or stool?",
            options: [
                { text: "No", weights: {} },
                { text: "Bright red blood on tissue paper", weights: { "Hemorrhoids": 4, "Anal Fissure": 3 } },
                { text: "Dark, tarry, or black stools", weights: { "Upper GI Bleed": 5, "Ulcer": 4 }, redFlag: true },
                { text: "Vomiting blood or 'coffee ground' material", weights: { "Severe GI Bleed": 5, "Medical Emergency": 5 }, redFlag: true }
            ]
        },
        {
            text: "Do you also have a fever?",
            options: [
                { text: "No fever", weights: { "Food Poisoning": 1, "IBS": 1, "Indigestion": 1 } },
                { text: "Low-grade fever (under 100.4°F)", weights: { "Viral Gastroenteritis": 3 } },
                { text: "High fever (>101°F) with chills", weights: { "Bacterial Infection": 3, "Appendicitis": 3, "Diverticulitis": 3 }, redFlag: true },
                { text: "Not sure", weights: {} }
            ]
        },
        {
            text: "Is there any change in your symptoms when you eat?",
            options: [
                { text: "Worse right after eating", weights: { "Acid Reflux / GERD": 3, "Gallbladder Issue": 2 } },
                { text: "Feels better after eating, then worse later", weights: { "Stomach Ulcer": 4 } },
                { text: "Eating triggers diarrhea quickly", weights: { "Food Intolerance": 3, "IBS": 3 } },
                { text: "Eating doesn't affect it", weights: { "Viral Gastroenteritis": 1 } }
            ]
        },
        {
            text: "How severe is the pain on a scale of 1–10?",
            options: [
                { text: "1–3 (Mild, annoying)", weights: { "Indigestion": 2, "Gas": 2 } },
                { text: "4–6 (Moderate, uncomfortable)", weights: { "Gastroenteritis (Stomach Bug)": 2, "Food Poisoning": 2 } },
                { text: "7–8 (Severe, difficult to focus)", weights: { "Gallstone Attack": 3, "Kidney Stone": 3 } },
                { text: "9–10 (Sudden, sharp, agonizing pain)", weights: { "Appendicitis": 4, "Perforated Ulcer": 4, "Medical Emergency": 5 }, redFlag: true }
            ]
        }
    ],

    // ─────────────────────────────────────────────
    // 3. HEAD & NEURO (already written — kept as-is)
    // ─────────────────────────────────────────────
    head_neuro: [
        {
            text: "How would you describe your headache?",
            options: [
                { text: "Tight band squeezing around head", weights: { "Tension Headache": 4, "Stress": 2 } },
                { text: "Throbbing/pulsating on one side", weights: { "Migraine": 4 } },
                { text: "Sharp, intense pain in/around one eye", weights: { "Cluster Headache": 4 } },
                { text: "Sudden, explosive 'worst of my life'", weights: { "Aneurysm / Hemorrhage": 5, "Medical Emergency": 5 }, redFlag: true }
            ]
        },
        {
            text: "Where is the pain mainly located?",
            options: [
                { text: "Forehead, temples, or back of head/neck", weights: { "Tension Headache": 3 } },
                { text: "Front of face, cheeks, behind forehead", weights: { "Sinus Headache": 4 } },
                { text: "Only on the left or the right side", weights: { "Migraine": 3, "Cluster Headache": 2 } },
                { text: "It's completely all over my head", weights: { "Systemic Infection (e.g., Flu)": 2, "Dehydration": 2 } }
            ]
        },
        {
            text: "Are you extremely sensitive to light or sound?",
            options: [
                { text: "No, light and sound are fine", weights: { "Tension Headache": 2, "Sinus Headache": 1 } },
                { text: "A little sensitive", weights: { "Mild Migraine": 2 } },
                { text: "Yes, I need a dark, quiet room", weights: { "Migraine": 4, "Meningitis": 2 } },
                { text: "Yes, and light makes the pain sharply worse", weights: { "Migraine": 3, "Meningitis": 2 } }
            ]
        },
        {
            text: "Are you experiencing nausea or vomiting?",
            options: [
                { text: "No", weights: { "Tension Headache": 2 } },
                { text: "Mild nausea, no vomiting", weights: { "Migraine": 2 } },
                { text: "Severe nausea and vomiting", weights: { "Severe Migraine": 3, "Increased Intracranial Pressure": 2 } },
                { text: "Vomiting without nausea, especially morning", weights: { "Neurological Issue": 4 }, redFlag: true }
            ]
        },
        {
            text: "Are you experiencing any numbness, weakness, or trouble speaking?",
            options: [
                { text: "No other symptoms", weights: { "Tension Headache": 1, "Migraine": 1 } },
                { text: "Tingling in face/hand that moves slowly (Aura)", weights: { "Migraine with Aura": 4 } },
                { text: "Sudden weakness on one side of body", weights: { "Stroke / TIA": 5 }, redFlag: true },
                { text: "Sudden slurred speech or facial drooping", weights: { "Stroke": 5, "Medical Emergency": 5 }, redFlag: true }
            ]
        },
        {
            text: "Is your vision affected?",
            options: [
                { text: "Vision is perfectly normal", weights: { "Tension Headache": 1 } },
                { text: "Seeing flashing lights, zig-zags, or blind spots", weights: { "Migraine with Aura": 4 } },
                { text: "Sudden blurry or double vision", weights: { "Stroke / Neuro Issue": 4 }, redFlag: true },
                { text: "Pain when moving eyes", weights: { "Optic Neuritis": 3, "Sinus Infection": 2 } }
            ]
        },
        {
            text: "Does the pain get worse with specific actions?",
            options: [
                { text: "Worse when bending over", weights: { "Sinus Headache": 3 } },
                { text: "Worse with physical activity (walking stairs)", weights: { "Migraine": 3 } },
                { text: "Worse when lying down", weights: { "Intracranial Pressure Issue": 3 }, redFlag: true },
                { text: "No change with movement", weights: { "Tension Headache": 2 } }
            ]
        },
        {
            text: "Do you have a stiff neck and fever?",
            options: [
                { text: "No", weights: {} },
                { text: "Stiff neck (muscle tension), no fever", weights: { "Tension Headache": 3, "Cervicogenic Headache": 3 } },
                { text: "Fever, but neck moves fine", weights: { "Flu / Viral Illness": 3 } },
                { text: "High fever AND unable to touch chin to chest", weights: { "Meningitis": 5, "Medical Emergency": 5 }, redFlag: true }
            ]
        }
    ],

    // ─────────────────────────────────────────────
    // 4. SKIN & RASHES (new)
    // ─────────────────────────────────────────────
    skin_rashes: [
        {
            text: "How would you describe the skin problem?",
            options: [
                { text: "Red, flat rash or blotches", weights: { "Viral Rash": 3, "Allergic Reaction": 3, "Heat Rash": 2 } },
                { text: "Raised, itchy bumps or hives", weights: { "Urticaria (Hives)": 4, "Allergic Reaction": 4 } },
                { text: "Blisters or fluid-filled sores", weights: { "Chickenpox": 4, "Herpes / Cold Sores": 3, "Contact Dermatitis": 2 } },
                { text: "Dry, scaly, or flaky patches", weights: { "Eczema (Atopic Dermatitis)": 4, "Psoriasis": 4, "Fungal Infection": 2 } }
            ]
        },
        {
            text: "Where is the rash or skin issue located?",
            options: [
                { text: "Face, neck, or scalp", weights: { "Seborrheic Dermatitis": 3, "Acne": 2, "Rosacea": 2 } },
                { text: "Trunk (chest, back, abdomen)", weights: { "Chickenpox": 3, "Shingles": 3, "Pityriasis Rosea": 3 } },
                { text: "Arms, legs, or hands", weights: { "Eczema": 3, "Contact Dermatitis": 3, "Psoriasis": 2 } },
                { text: "All over the body / widespread", weights: { "Viral Rash (Measles/Rubella)": 4, "Drug Reaction": 4, "Allergic Reaction": 3 } }
            ]
        },
        {
            text: "Is the rash itchy?",
            options: [
                { text: "No itching at all", weights: { "Shingles (before blisters)": 2, "Pityriasis Rosea": 2 } },
                { text: "Mildly itchy", weights: { "Mild Eczema": 2, "Heat Rash": 2 } },
                { text: "Very itchy, hard to resist scratching", weights: { "Eczema": 4, "Urticaria (Hives)": 4, "Scabies": 4 } },
                { text: "Burning or painful, not just itchy", weights: { "Shingles": 4, "Cellulitis": 3, "Contact Dermatitis": 2 } }
            ]
        },
        {
            text: "Did the rash appear suddenly or gradually?",
            options: [
                { text: "Appeared within minutes to hours", weights: { "Allergic Reaction": 4, "Urticaria (Hives)": 4 } },
                { text: "Developed over 1–2 days", weights: { "Chickenpox": 3, "Viral Rash": 3 } },
                { text: "Slowly grew over days to weeks", weights: { "Psoriasis": 3, "Eczema": 2, "Ringworm (Tinea)": 3 } },
                { text: "Been there for months or years", weights: { "Chronic Eczema": 3, "Psoriasis": 4, "Vitiligo": 2 } }
            ]
        },
        {
            text: "Do you have a fever alongside the skin problem?",
            options: [
                { text: "No fever", weights: { "Eczema": 1, "Contact Dermatitis": 1, "Psoriasis": 1 } },
                { text: "Low-grade fever", weights: { "Chickenpox": 3, "Viral Rash": 3 } },
                { text: "High fever with rash", weights: { "Measles": 4, "Scarlet Fever": 4, "Dengue": 3 }, redFlag: true },
                { text: "Rash spreading rapidly with fever/chills", weights: { "Cellulitis": 4, "Meningococcal Disease": 5 }, redFlag: true }
            ]
        },
        {
            text: "Did something trigger the skin problem?",
            options: [
                { text: "New soap, detergent, or jewellery", weights: { "Contact Dermatitis": 5, "Nickel Allergy": 3 } },
                { text: "New food, medication, or insect bite", weights: { "Allergic Reaction": 4, "Urticaria (Hives)": 3 } },
                { text: "Sun exposure", weights: { "Sunburn": 3, "Polymorphic Light Eruption": 3 } },
                { text: "No obvious trigger", weights: { "Eczema": 2, "Psoriasis": 2, "Viral Rash": 2 } }
            ]
        },
        {
            text: "Does the rash have a specific pattern or shape?",
            options: [
                { text: "Ring-shaped or circular patch", weights: { "Ringworm (Tinea Corporis)": 5, "Lyme Disease": 3 } },
                { text: "Blisters in a band on one side of body", weights: { "Shingles (Herpes Zoster)": 5 } },
                { text: "Small red dots that don't fade on pressure", weights: { "Meningococcal Rash": 5, "Petechiae": 4 }, redFlag: true },
                { text: "No specific pattern, just widespread", weights: { "Viral Rash": 3, "Drug Reaction": 3 } }
            ]
        },
        {
            text: "Do you have any other symptoms alongside the rash?",
            options: [
                { text: "No other symptoms", weights: { "Contact Dermatitis": 2, "Mild Eczema": 2 } },
                { text: "Runny nose, watery eyes, sneezing", weights: { "Allergic Reaction": 4 } },
                { text: "Swollen lymph nodes", weights: { "Rubella": 3, "Chickenpox": 2, "Viral Illness": 3 } },
                { text: "Throat tightness or difficulty breathing", weights: { "Anaphylaxis": 5, "Medical Emergency": 5 }, redFlag: true }
            ]
        }
    ],

    // ─────────────────────────────────────────────
    // 5. BREATHING & CHEST (new)
    // ─────────────────────────────────────────────
    breathing_chest: [
        {
            text: "What is your main symptom?",
            options: [
                { text: "Shortness of breath / difficulty breathing", weights: { "Asthma": 3, "Pneumonia": 2, "Anxiety": 2, "COPD": 2 } },
                { text: "Chest pain or tightness", weights: { "Angina": 3, "Heart Attack": 3, "Costochondritis": 2, "GERD": 2 } },
                { text: "Persistent cough", weights: { "Bronchitis": 3, "Asthma": 2, "GERD": 2, "TB": 2 } },
                { text: "Wheezing or noisy breathing", weights: { "Asthma": 4, "Bronchitis": 3, "COPD": 3 } }
            ]
        },
        {
            text: "How would you describe the chest pain (if any)?",
            options: [
                { text: "I don't have chest pain", weights: {} },
                { text: "Sharp pain worse when breathing in", weights: { "Pleuritis": 4, "Costochondritis": 3, "Pneumonia": 2 } },
                { text: "Crushing/squeezing pressure in the centre", weights: { "Heart Attack": 5, "Angina": 4 }, redFlag: true },
                { text: "Burning sensation behind the breastbone", weights: { "Acid Reflux / GERD": 5, "Esophagitis": 3 } }
            ]
        },
        {
            text: "Does the chest pain spread to other areas?",
            options: [
                { text: "No, stays in one spot", weights: { "Costochondritis": 3, "Pleuritis": 2 } },
                { text: "Spreads to left arm, jaw, or shoulder", weights: { "Heart Attack": 5, "Angina": 4 }, redFlag: true },
                { text: "Spreads to the back", weights: { "Aortic Dissection": 4, "Heart Attack": 3 }, redFlag: true },
                { text: "Spreads to the neck or ear", weights: { "Angina": 3, "Esophageal Spasm": 2 } }
            ]
        },
        {
            text: "When does the shortness of breath occur?",
            options: [
                { text: "Only during exercise or exertion", weights: { "Deconditioning": 2, "Mild Asthma": 2, "Angina": 2 } },
                { text: "When exposed to triggers (dust, pollen, cold)", weights: { "Asthma": 4, "Allergic Rhinitis": 3 } },
                { text: "Constantly, even while resting", weights: { "Severe Asthma": 3, "Pneumonia": 3, "Heart Failure": 3 }, redFlag: true },
                { text: "Suddenly came on, no warning", weights: { "Pulmonary Embolism": 4, "Pneumothorax": 4 }, redFlag: true }
            ]
        },
        {
            text: "Do you have a cough? If so, what do you cough up?",
            options: [
                { text: "No cough", weights: { "Angina": 1, "Anxiety": 1 } },
                { text: "Dry cough with no mucus", weights: { "Asthma": 3, "GERD-related Cough": 2, "COVID-19": 2 } },
                { text: "Yellow or green mucus", weights: { "Bacterial Pneumonia": 4, "Bronchitis": 3, "Sinusitis": 2 } },
                { text: "Blood-tinged or rust-coloured mucus", weights: { "Tuberculosis (TB)": 4, "Pneumonia": 3, "Lung Cancer": 3 }, redFlag: true }
            ]
        },
        {
            text: "Do you have a fever alongside your breathing symptoms?",
            options: [
                { text: "No fever", weights: { "Asthma": 2, "GERD": 2, "Anxiety": 2 } },
                { text: "Low-grade fever", weights: { "Viral Pneumonia": 3, "Bronchitis": 3 } },
                { text: "High fever with chills", weights: { "Bacterial Pneumonia": 4, "Severe Infection": 3 }, redFlag: true },
                { text: "Fever, night sweats, and weight loss", weights: { "Tuberculosis (TB)": 5, "Lymphoma": 3 }, redFlag: true }
            ]
        },
        {
            text: "Do your symptoms get worse when lying flat?",
            options: [
                { text: "No, position doesn't matter", weights: { "Asthma": 2, "Pneumonia": 2 } },
                { text: "Worse lying flat, better sitting up", weights: { "Heart Failure": 4, "Pleural Effusion": 3 }, redFlag: true },
                { text: "Acid taste when lying down", weights: { "GERD": 4, "Acid Reflux": 4 } },
                { text: "Pain worse lying on one side", weights: { "Pleuritis": 3, "Pericarditis": 3 } }
            ]
        },
        {
            text: "Do you have swollen legs, ankles, or feet?",
            options: [
                { text: "No swelling", weights: { "Asthma": 1, "Bronchitis": 1 } },
                { text: "Mild ankle swelling at end of day", weights: { "Venous Insufficiency": 2 } },
                { text: "Both legs swollen, especially in the morning", weights: { "Heart Failure": 4, "Kidney Disease": 3 }, redFlag: true },
                { text: "One leg red, hot, swollen, and painful", weights: { "Deep Vein Thrombosis (DVT)": 5 }, redFlag: true }
            ]
        }
    ],

    // ─────────────────────────────────────────────
    // 6. MUSCLES & JOINTS (new)
    // ─────────────────────────────────────────────
    muscles_joints: [
        {
            text: "What is your main complaint?",
            options: [
                { text: "Joint pain (knees, hips, fingers, shoulders)", weights: { "Osteoarthritis": 3, "Rheumatoid Arthritis": 3, "Gout": 2 } },
                { text: "Muscle pain or soreness", weights: { "Muscle Strain": 3, "Fibromyalgia": 3, "Viral Myalgia": 2 } },
                { text: "Back pain", weights: { "Lower Back Strain": 3, "Disc Herniation": 3, "Sciatica": 2 } },
                { text: "Stiffness — hard to move in the morning", weights: { "Rheumatoid Arthritis": 4, "Ankylosing Spondylitis": 3 } }
            ]
        },
        {
            text: "How many joints are affected?",
            options: [
                { text: "Just one joint", weights: { "Gout": 4, "Septic Arthritis": 3, "Injury": 3 } },
                { text: "Two or three joints", weights: { "Reactive Arthritis": 3, "Early Rheumatoid Arthritis": 2 } },
                { text: "Many joints, both sides of body", weights: { "Rheumatoid Arthritis": 4, "Lupus": 3, "Fibromyalgia": 2 } },
                { text: "Not joints — it's the muscles all over", weights: { "Fibromyalgia": 4, "Polymyalgia Rheumatica": 3, "Viral Illness": 3 } }
            ]
        },
        {
            text: "Is the affected area swollen, red, or warm to the touch?",
            options: [
                { text: "No swelling or redness", weights: { "Osteoarthritis": 3, "Fibromyalgia": 2 } },
                { text: "Mild swelling", weights: { "Mild Arthritis": 2, "Bursitis": 2 } },
                { text: "Significant swelling with redness and warmth", weights: { "Gout": 4, "Rheumatoid Arthritis": 3, "Bursitis": 3 } },
                { text: "Extreme redness, hot, and very painful", weights: { "Septic Arthritis": 5, "Severe Gout": 4 }, redFlag: true }
            ]
        },
        {
            text: "When did the pain start?",
            options: [
                { text: "Suddenly after an injury or fall", weights: { "Sprain / Strain": 4, "Fracture": 3 } },
                { text: "Suddenly for no obvious reason", weights: { "Gout": 4, "Septic Arthritis": 3 } },
                { text: "Gradually got worse over months", weights: { "Osteoarthritis": 4, "Rheumatoid Arthritis": 3 } },
                { text: "After a recent infection or illness", weights: { "Reactive Arthritis": 4, "Viral Arthralgia": 3 } }
            ]
        },
        {
            text: "Does the pain radiate down your leg or arm?",
            options: [
                { text: "No, stays in one area", weights: { "Localised Injury": 2, "Osteoarthritis": 2 } },
                { text: "Shoots down the back of my leg", weights: { "Sciatica": 5, "Disc Herniation": 4 } },
                { text: "Shoots down the arm with tingling", weights: { "Cervical Disc Disease": 4, "Thoracic Outlet Syndrome": 3 } },
                { text: "Numbness and weakness in leg — came on suddenly", weights: { "Cauda Equina Syndrome": 5 }, redFlag: true }
            ]
        },
        {
            text: "How long have you had this pain?",
            options: [
                { text: "Less than a week", weights: { "Acute Injury": 3, "Gout Attack": 3, "Viral Myalgia": 2 } },
                { text: "1–4 weeks", weights: { "Subacute Injury": 2, "Reactive Arthritis": 2 } },
                { text: "1–3 months", weights: { "Chronic Strain": 2, "Early Arthritis": 2 } },
                { text: "More than 3 months", weights: { "Osteoarthritis": 4, "Rheumatoid Arthritis": 4, "Fibromyalgia": 3 } }
            ]
        },
        {
            text: "Is the morning stiffness a problem?",
            options: [
                { text: "No stiffness", weights: { "Fibromyalgia": 1, "Gout": 1 } },
                { text: "Stiff for under 30 minutes then fine", weights: { "Osteoarthritis": 3 } },
                { text: "Stiff for over 1 hour in the morning", weights: { "Rheumatoid Arthritis": 4, "Ankylosing Spondylitis": 3 } },
                { text: "Stiff all day, worse with rest", weights: { "Inflammatory Arthritis": 4, "Lupus": 2 } }
            ]
        },
        {
            text: "Do you have any associated symptoms?",
            options: [
                { text: "No other symptoms", weights: { "Localised Injury": 2, "Osteoarthritis": 2 } },
                { text: "Fatigue and general feeling unwell", weights: { "Rheumatoid Arthritis": 3, "Lupus": 3, "Fibromyalgia": 3 } },
                { text: "Skin rash (butterfly-shaped on face)", weights: { "Lupus": 5 } },
                { text: "Back pain and eye inflammation", weights: { "Ankylosing Spondylitis": 4, "Reactive Arthritis": 3 } }
            ]
        }
    ],

    // ─────────────────────────────────────────────
    // 7. EYE, EAR, NOSE & THROAT (new)
    // ─────────────────────────────────────────────
    ent: [
        {
            text: "Which area is bothering you most?",
            options: [
                { text: "Eyes (redness, discharge, pain)", weights: { "Conjunctivitis (Pink Eye)": 3, "Allergic Eye": 3, "Stye": 2 } },
                { text: "Ears (pain, hearing loss, discharge)", weights: { "Ear Infection (Otitis Media)": 4, "Swimmer's Ear": 3, "Wax Blockage": 2 } },
                { text: "Nose (blocked, runny, losing smell)", weights: { "Sinusitis": 3, "Allergic Rhinitis": 3, "Common Cold": 2 } },
                { text: "Throat (sore, hoarse, difficulty swallowing)", weights: { "Strep Throat": 3, "Tonsillitis": 3, "Laryngitis": 3 } }
            ]
        },
        {
            text: "Describe the eye problem (if applicable):",
            options: [
                { text: "No eye problem", weights: {} },
                { text: "Red, gritty, watery, with discharge", weights: { "Conjunctivitis (Pink Eye)": 4, "Bacterial Eye Infection": 3 } },
                { text: "Red, itchy, watery — both eyes together", weights: { "Allergic Conjunctivitis": 5 } },
                { text: "Sudden vision loss or severe eye pain", weights: { "Acute Glaucoma": 5, "Medical Emergency": 5 }, redFlag: true }
            ]
        },
        {
            text: "Describe the ear problem (if applicable):",
            options: [
                { text: "No ear problem", weights: {} },
                { text: "Deep throbbing ear pain, worse at night", weights: { "Otitis Media (Middle Ear Infection)": 4 } },
                { text: "Ear canal itchy and painful when touched", weights: { "Otitis Externa (Swimmer's Ear)": 4 } },
                { text: "Ringing in ear and dizziness / vertigo", weights: { "Meniere's Disease": 4, "Labyrinthitis": 3 } }
            ]
        },
        {
            text: "Describe the nose problem (if applicable):",
            options: [
                { text: "No nose problem", weights: {} },
                { text: "Blocked nose, thick yellow/green discharge", weights: { "Sinusitis": 4, "Bacterial Rhinitis": 3 } },
                { text: "Watery clear discharge, sneezing, itchy", weights: { "Allergic Rhinitis": 5 } },
                { text: "Nosebleed that won't stop after 20 minutes", weights: { "Epistaxis Emergency": 4 }, redFlag: true }
            ]
        },
        {
            text: "Describe the throat problem (if applicable):",
            options: [
                { text: "No throat problem", weights: {} },
                { text: "Very sore throat, difficulty swallowing, fever", weights: { "Strep Throat": 4, "Tonsillitis": 4 } },
                { text: "Hoarse voice, throat feels raw", weights: { "Laryngitis": 4, "Vocal Strain": 3 } },
                { text: "Muffled voice, drooling, throat swelling", weights: { "Peritonsillar Abscess": 5, "Epiglottitis": 5 }, redFlag: true }
            ]
        },
        {
            text: "Do you have a fever with these symptoms?",
            options: [
                { text: "No fever", weights: { "Allergic Rhinitis": 2, "Wax Blockage": 1 } },
                { text: "Low-grade fever", weights: { "Viral URTI": 3, "Mild Sinusitis": 2 } },
                { text: "High fever and chills", weights: { "Bacterial Sinusitis": 3, "Strep Throat": 4, "Otitis Media": 3 }, redFlag: true },
                { text: "Fever with severe headache and stiff neck", weights: { "Meningitis": 5, "Medical Emergency": 5 }, redFlag: true }
            ]
        },
        {
            text: "Are your symptoms seasonal or year-round?",
            options: [
                { text: "Seasonal — worse in spring or autumn", weights: { "Allergic Rhinitis (Hay Fever)": 5, "Pollen Allergy": 4 } },
                { text: "Year-round but worse in dusty environments", weights: { "Perennial Allergic Rhinitis": 4, "Dust Mite Allergy": 4 } },
                { text: "Started suddenly, no seasonal pattern", weights: { "Acute Infection": 3 } },
                { text: "Came after a cold or flu", weights: { "Post-Viral Sinusitis": 3, "Secondary Infection": 3 } }
            ]
        },
        {
            text: "Have you had any recent dental pain or procedures?",
            options: [
                { text: "No dental issues", weights: {} },
                { text: "Upper tooth pain on the same side as sinus pain", weights: { "Dental Sinusitis": 4 } },
                { text: "Jaw pain and difficulty opening mouth", weights: { "TMJ Disorder": 4, "Dental Abscess": 3 } },
                { text: "Throat and ear pain on same side", weights: { "Peritonsillar Abscess": 3, "Quinsy": 3 } }
            ]
        }
    ],

    // ─────────────────────────────────────────────
    // 8. WOMEN'S HEALTH (new)
    // ─────────────────────────────────────────────
    womens_health: [
        {
            text: "What is your primary concern?",
            options: [
                { text: "Pelvic or lower abdominal pain", weights: { "Menstrual Cramps (Dysmenorrhea)": 3, "Ovarian Cyst": 3, "Endometriosis": 2, "PID": 2 } },
                { text: "Irregular or missed periods", weights: { "PCOS": 3, "Thyroid Disorder": 2, "Pregnancy": 3, "Stress-related Amenorrhea": 2 } },
                { text: "Unusual vaginal discharge or odour", weights: { "Bacterial Vaginosis": 4, "Yeast Infection": 3, "STI": 3 } },
                { text: "Breast pain or changes", weights: { "Fibrocystic Breast Changes": 3, "Mastitis": 3, "Hormonal Changes": 2 } }
            ]
        },
        {
            text: "Could you be pregnant?",
            options: [
                { text: "No — not sexually active or using contraception", weights: {} },
                { text: "Possibly — missed period and pregnancy symptoms", weights: { "Pregnancy": 5 } },
                { text: "I'm already confirmed pregnant", weights: { "Pregnancy Complication": 2 } },
                { text: "Sudden severe pain with missed period", weights: { "Ectopic Pregnancy": 5, "Medical Emergency": 5 }, redFlag: true }
            ]
        },
        {
            text: "How would you describe your menstrual pain?",
            options: [
                { text: "Normal, manageable period pain", weights: { "Primary Dysmenorrhea": 3 } },
                { text: "Severe cramps that stop daily activities", weights: { "Endometriosis": 4, "Fibroids": 3 } },
                { text: "Pain throughout the month, not just with period", weights: { "Endometriosis": 4, "Adenomyosis": 3 } },
                { text: "No period pain — other pelvic pain", weights: { "Ovarian Cyst": 3, "PID": 2 } }
            ]
        },
        {
            text: "Describe any vaginal discharge (colour, smell, texture):",
            options: [
                { text: "Normal — clear or white, no smell", weights: {} },
                { text: "White, thick, cottage-cheese-like, itchy", weights: { "Yeast Infection (Thrush)": 5 } },
                { text: "Grey/white, fishy smell, watery", weights: { "Bacterial Vaginosis": 5 } },
                { text: "Yellow/green, foul smell, with pelvic pain", weights: { "STI (Chlamydia/Gonorrhoea)": 4, "PID": 4 }, redFlag: true }
            ]
        },
        {
            text: "Do you have pain during intercourse?",
            options: [
                { text: "No pain", weights: {} },
                { text: "Mild discomfort on some occasions", weights: { "Dryness / Hormonal Change": 2 } },
                { text: "Pain deep inside during intercourse", weights: { "Endometriosis": 4, "Ovarian Cyst": 3, "PID": 3 } },
                { text: "Pain at the entrance only", weights: { "Vaginismus": 3, "Vulvodynia": 3, "Yeast Infection": 2 } }
            ]
        },
        {
            text: "Are your periods heavier or lighter than usual?",
            options: [
                { text: "Normal flow", weights: {} },
                { text: "Much heavier — soaking through pads/tampons", weights: { "Fibroids": 4, "Adenomyosis": 3, "Endometrial Polyp": 2 } },
                { text: "Very light or spotting only", weights: { "PCOS": 3, "Thyroid Issue": 2, "Perimenopause": 2 } },
                { text: "Bleeding between periods or after sex", weights: { "Cervical Polyp": 3, "Cervical Infection": 3, "Cervical Cancer (check up)": 2 }, redFlag: true }
            ]
        },
        {
            text: "Do you have any urinary symptoms?",
            options: [
                { text: "No urinary symptoms", weights: {} },
                { text: "Burning or stinging when urinating", weights: { "Urinary Tract Infection (UTI)": 4 } },
                { text: "Needing to urinate very frequently", weights: { "UTI": 3, "Interstitial Cystitis": 3 } },
                { text: "Severe lower back or flank pain with fever", weights: { "Kidney Infection (Pyelonephritis)": 5 }, redFlag: true }
            ]
        },
        {
            text: "How old are you, and do you have any of these?",
            options: [
                { text: "Under 40, no major health history", weights: {} },
                { text: "35–50, irregular periods, hot flushes", weights: { "Perimenopause": 4, "Thyroid Disorder": 2 } },
                { text: "Any age — diagnosed with PCOS or endometriosis", weights: { "PCOS Flare": 3, "Endometriosis Flare": 3 } },
                { text: "Over 50, post-menopausal with new bleeding", weights: { "Endometrial Cancer (check up)": 4 }, redFlag: true }
            ]
        }
    ],

    // ─────────────────────────────────────────────
    // 9. MEN'S HEALTH (new)
    // ─────────────────────────────────────────────
    mens_health: [
        {
            text: "What is your primary concern?",
            options: [
                { text: "Urinary problems (frequent, painful, weak flow)", weights: { "Urinary Tract Infection (UTI)": 3, "Benign Prostatic Hyperplasia (BPH)": 3, "Prostatitis": 3 } },
                { text: "Pain or swelling in the groin/testicles", weights: { "Epididymitis": 3, "Testicular Torsion": 3, "Inguinal Hernia": 2 } },
                { text: "Sexual health concerns", weights: { "STI": 3, "Erectile Dysfunction": 2 } },
                { text: "Fatigue, low mood, low libido", weights: { "Low Testosterone": 4, "Depression": 3, "Sleep Apnea": 2 } }
            ]
        },
        {
            text: "Describe your urinary symptoms (if any):",
            options: [
                { text: "No urinary symptoms", weights: {} },
                { text: "Burning/stinging when urinating", weights: { "UTI": 4, "Urethritis": 4, "STI (Gonorrhoea/Chlamydia)": 3 } },
                { text: "Weak stream, difficulty starting, frequent urge", weights: { "BPH (Enlarged Prostate)": 4, "Prostate Cancer (check)": 2 } },
                { text: "Complete inability to urinate", weights: { "Urinary Retention": 5, "Medical Emergency": 5 }, redFlag: true }
            ]
        },
        {
            text: "Do you have any testicular or groin pain?",
            options: [
                { text: "No pain", weights: {} },
                { text: "Dull ache in one testicle, came on gradually", weights: { "Epididymitis": 4, "Varicocele": 3 } },
                { text: "Sudden severe pain in one testicle", weights: { "Testicular Torsion": 5, "Medical Emergency": 5 }, redFlag: true },
                { text: "Lump or change in size/shape of testicle", weights: { "Testicular Cancer (check up)": 4, "Epididymal Cyst": 2 }, redFlag: true }
            ]
        },
        {
            text: "Do you have any discharge from the penis?",
            options: [
                { text: "No discharge", weights: {} },
                { text: "Clear discharge only when aroused", weights: { "Normal Pre-ejaculate": 1 } },
                { text: "White, yellow, or green discharge", weights: { "Gonorrhoea": 5, "Chlamydia": 4, "Urethritis": 3 } },
                { text: "Blood in urine or semen", weights: { "Prostatitis": 3, "Kidney Stone": 3, "Bladder/Prostate Issue": 3 }, redFlag: true }
            ]
        },
        {
            text: "Have you noticed changes in your energy, mood, or weight?",
            options: [
                { text: "No significant changes", weights: {} },
                { text: "Persistent fatigue despite enough sleep", weights: { "Low Testosterone": 3, "Sleep Apnea": 3, "Anaemia": 2 } },
                { text: "Low mood, irritability, loss of motivation", weights: { "Depression": 4, "Low Testosterone": 3 } },
                { text: "Unexpected weight gain, feeling cold, hair loss", weights: { "Hypothyroidism": 4 } }
            ]
        },
        {
            text: "Do you have any issues with erections or sexual function?",
            options: [
                { text: "No issues", weights: {} },
                { text: "Difficulty maintaining erection (ED)", weights: { "Erectile Dysfunction": 4, "Cardiovascular Disease": 2, "Low Testosterone": 2 } },
                { text: "Reduced sex drive / libido", weights: { "Low Testosterone": 4, "Depression": 3 } },
                { text: "Pain during erection or ejaculation", weights: { "Prostatitis": 4, "Peyronie's Disease": 3 } }
            ]
        },
        {
            text: "Do you have any lower back, hip, or bone pain?",
            options: [
                { text: "No", weights: {} },
                { text: "Mild lower back pain", weights: { "Prostatitis": 2, "Musculoskeletal": 2 } },
                { text: "Persistent deep bone or hip pain", weights: { "Prostate Cancer (bone mets, check)": 3 }, redFlag: true },
                { text: "Severe bone pain with unexplained weight loss", weights: { "Cancer (check up needed)": 4 }, redFlag: true }
            ]
        },
        {
            text: "How old are you?",
            options: [
                { text: "Under 30", weights: { "STI": 2, "Testicular Issues": 2 } },
                { text: "30–50", weights: { "Prostatitis": 2, "Low Testosterone": 2, "BPH early": 1 } },
                { text: "50–65", weights: { "BPH": 3, "Prostate Cancer risk": 2, "Low Testosterone": 2 } },
                { text: "Over 65", weights: { "BPH": 4, "Prostate Cancer (screening)": 3 }, redFlag: true }
            ]
        }
    ]

}; // end quizQuestions