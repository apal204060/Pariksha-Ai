import { AppState } from '../types/study';
import { getTodayIsoDate, syncTrackerCategoriesWithActivity } from '../utils/studyEngine';

export function createInitialAppState(): AppState {
  const today = getTodayIsoDate();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
  const fourDaysAgo = new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10);

  const baseState: AppState = {
    version: 1,
    theme: 'system',
    profile: {
      uid: 'local_aspirant_01',
      displayName: 'Exam Aspirant',
      authMethod: 'local',
      lastSyncedAt: new Date().toISOString(),
    },
    diagnostic: {
      completed: true,
      updatedAt: new Date().toISOString(),
      targetExamName: 'Combined Graduate & Civil Services Exam 2027',
      examDate: '2027-05-24',
      currentLevel: 'Intermediate',
      dailyHoursTarget: 6,
      dailyQuestionsTarget: 40,
      weeklyTestsTarget: 5,
      baselineAccuracyPercent: 68,
      focusPriority: 'Accuracy & Concepts',
    },
    documents: [
      {
        id: 'doc_const_amendments',
        title: 'Fundamental Rights & Constitutional Remedies — Scanned Handout',
        fileType: 'pdf',
        fileName: 'Fundamental_Rights_Articles_12_to_35.pdf',
        fileSizeKb: 428,
        createdAt: twoDaysAgo,
        updatedAt: today,
        ocrStatus: 'completed',
        extractedQuestionsCount: 5,
        pages: [
          {
            id: 'page_1',
            pageNumber: 1,
            label: 'Page 1 — Articles 14 to 21 Overview',
            selected: true,
            confidence: 98,
            sourceType: 'pdf',
            ocrText: `Article 14 of the Constitution guarantees equality before the law and equal protection of the laws within the territory of India.
Article 19 protects six core freedoms including speech and expression, assembly, association, movement, residence, and profession.
Article 21 states that no person shall be deprived of his life or personal liberty except according to procedure established by law. Following the Maneka Gandhi v. Union of India (1978) judgment, "procedure established by law" must be fair, just, and reasonable.
The 86th Constitutional Amendment Act, 2002 inserted Article 21A making free and compulsory education for children aged 6 to 14 years a Fundamental Right.`,
          },
          {
            id: 'page_2',
            pageNumber: 2,
            label: 'Page 2 — Constitutional Writs under Article 32 & 226',
            selected: true,
            confidence: 97,
            sourceType: 'pdf',
            ocrText: `Article 32 confers the Right to Constitutional Remedies, empowering the Supreme Court to issue five writs: Habeas Corpus, Mandamus, Prohibition, Certiorari, and Quo Warranto.
Habeas Corpus ("to have the body of") is issued to release a person who has been unlawfully detained, whether by public authorities or private individuals.
Mandamus ("we command") is issued by a court to a public official asking them to perform official duties they have failed or refused to perform; it cannot be issued against a private individual or the President/Governors.
Quo Warranto ("by what authority or warrant") is issued by the court to enquire into the legality of claim of a person to a public office.
Under Article 359, during a National Emergency, the enforcement of Fundamental Rights can be suspended by Presidential Order, EXCEPT Articles 20 and 21 (as mandated by the 44th Amendment Act, 1978).`,
          },
        ],
      },
      {
        id: 'doc_optics_thermodynamics',
        title: 'Applied Physics & Everyday Science — Camera Scan',
        fileType: 'camera',
        fileName: 'Physics_Optics_Scan_3Pages.jpg',
        fileSizeKb: 312,
        createdAt: yesterday,
        updatedAt: yesterday,
        ocrStatus: 'completed',
        extractedQuestionsCount: 4,
        pages: [
          {
            id: 'page_phys_1',
            pageNumber: 1,
            label: 'Page 1 — Total Internal Reflection & Optical Fibers',
            selected: true,
            confidence: 96,
            sourceType: 'camera',
            ocrText: `Total Internal Reflection (TIR) occurs when light travels from an optically denser medium (higher refractive index n1) to an optically rarer medium (lower refractive index n2) and the angle of incidence exceeds the critical angle.
Optical fibers transmit high-speed telecommunications signals over long distances with minimal loss using repeated Total Internal Reflection inside a high-refractive-index silica core surrounded by lower-index cladding.
Mirage formation on hot highways and the brilliance of cut diamonds are classic natural and applied examples of Total Internal Reflection.`,
          },
          {
            id: 'page_phys_2',
            pageNumber: 2,
            label: 'Page 2 — Scattering of Light & Lens Power',
            selected: true,
            confidence: 95,
            sourceType: 'camera',
            ocrText: `Rayleigh scattering states that the intensity of scattered light is inversely proportional to the fourth power of wavelength (I ∝ 1/λ^4). Shorter wavelengths (blue/violet) scatter much more strongly than longer wavelengths (red), making the clear daytime sky appear blue and danger signals use red light.
The power of a lens (P) is the reciprocal of its focal length in meters: P = 1 / f(m), measured in Dioptres (D). A converging (convex) lens has positive power (+D) and is used to correct hypermetropia (farsightedness), whereas a diverging (concave) lens has negative power (-D) and corrects myopia (nearsightedness).`,
          },
        ],
      },
    ],
    tests: [
      {
        id: 'test_const_remedies_01',
        title: 'Fundamental Rights & Writs Mastery Test',
        sourceDocumentId: 'doc_const_amendments',
        sourceDocumentTitle: 'Fundamental Rights & Constitutional Remedies — Scanned Handout',
        createdAt: twoDaysAgo,
        isTimed: true,
        timeLimitMinutes: 10,
        randomizeQuestions: false,
        randomizeOptions: false,
        questions: [
          {
            id: 'q_const_1',
            questionText:
              'Which Constitutional Amendment ensured that the Fundamental Rights guaranteed under Articles 20 and 21 cannot be suspended even during a National Emergency under Article 359?',
            questionHindi:
              'किस संविधान संशोधन ने यह सुनिश्चित किया कि अनुच्छेद 20 और 21 के तहत प्रदत्त मौलिक अधिकारों को राष्ट्रीय आपातकाल (अनुच्छेद 359) के दौरान भी निलंबित नहीं किया जा सकता है?',
            options: {
              A: '42nd Constitutional Amendment Act, 1976',
              B: '44th Constitutional Amendment Act, 1978',
              C: '86th Constitutional Amendment Act, 2002',
              D: '24th Constitutional Amendment Act, 1971',
            },
            correctOption: 'B',
            topicTag: 'Constitutional Writs & Rights',
            difficulty: 'Moderate',
            teacher: {
              detailedSolution:
                'The 44th Constitutional Amendment Act, 1978 amended Article 359 to safeguard personal liberty against arbitrary suspension during an Emergency. It explicitly stipulated that the President cannot suspend the right to move the Court for the enforcement of Fundamental Rights guaranteed by Article 20 (protection in respect of conviction for offences) and Article 21 (protection of life and personal liberty).',
              hindiExplanation:
                '44वें संविधान संशोधन अधिनियम, 1978 ने अनुच्छेद 359 में संशोधन करके यह प्रावधान किया कि राष्ट्रीय आपातकाल के दौरान भी अनुच्छेद 20 (अपराधों के लिए दोषसिद्धि के संबंध में संरक्षण) और अनुच्छेद 21 (प्राण और दैहिक स्वतंत्रता का संरक्षण) को निलंबित नहीं किया जा सकता। यह संशोधन आपातकाल के दुरुपयोग को रोकने के लिए लाया गया था।',
              keyPoints: [
                '44th Amendment Act (1978) made Articles 20 & 21 non-suspendable during National Emergency.',
                'Article 19 is automatically suspended under Article 358 only when Emergency is declared on grounds of War or External Aggression (not Armed Rebellion).',
                '86th Amendment Act (2002) introduced Article 21A (Right to Education for ages 6–14).',
              ],
              examRelevantInfo:
                'Frequently asked trap: Students often confuse Article 358 (automatic suspension of Art. 19 during external emergency) with Article 359 (Presidential order suspending enforcement of specified rights except Art. 20 & 21).',
              incorrectOptions: [
                {
                  option: 'A',
                  reason:
                    'The 42nd Amendment (1976), known as the Mini-Constitution, expanded executive powers during Emergency rather than protecting Articles 20 & 21.',
                  hindiReason:
                    '42वें संशोधन (1976) ने आपातकाल के दौरान कार्यपालिका की शक्तियों को बढ़ाया था, न कि अनुच्छेद 20 और 21 को सुरक्षा दी थी।',
                },
                {
                  option: 'C',
                  reason:
                    'The 86th Amendment (2002) inserted Article 21A (Right to Free and Compulsory Education for children aged 6 to 14 years).',
                  hindiReason:
                    '86वें संशोधन (2002) ने 6 से 14 वर्ष के बच्चों के लिए शिक्षा के अधिकार (अनुच्छेद 21A) को जोड़ा था।',
                },
                {
                  option: 'D',
                  reason:
                    'The 24th Amendment (1971) affirmed Parliament’s power to amend any part of the Constitution including Fundamental Rights under Article 368.',
                  hindiReason:
                    '24वें संशोधन (1971) ने अनुच्छेद 368 के तहत मौलिक अधिकारों सहित संविधान के किसी भी भाग में संशोधन करने की संसद की शक्ति की पुष्टि की थी।',
                },
              ],
              sourceExcerpt:
                'Under Article 359, during a National Emergency, the enforcement of Fundamental Rights can be suspended by Presidential Order, EXCEPT Articles 20 and 21 (as mandated by the 44th Amendment Act, 1978).',
              additionalInfo:
                'The 44th Amendment also replaced the ground of "Internal Disturbance" with "Armed Rebellion" under Article 352 and moved the Right to Property from Article 31 to Article 300A as a constitutional legal right.',
            },
          },
          {
            id: 'q_const_2',
            questionText:
              'Which writ under Article 32 can be issued against BOTH public authorities and private individuals to secure the release of an unlawfully detained person?',
            questionHindi:
              'अवैध रूप से हिरासत में लिए गए व्यक्ति की रिहाई सुनिश्चित करने के लिए अनुच्छेद 32 के तहत कौन-सी रिट सार्वजनिक प्राधिकरणों और निजी व्यक्तियों दोनों के विरुद्ध जारी की जा सकती है?',
            options: {
              A: 'Mandamus',
              B: 'Certiorari',
              C: 'Habeas Corpus',
              D: 'Quo Warranto',
            },
            correctOption: 'C',
            topicTag: 'Constitutional Writs & Rights',
            difficulty: 'Easy',
            teacher: {
              detailedSolution:
                'Habeas Corpus literally means "to have the body of". It is the bulwark of individual liberty against arbitrary detention and is uniquely maintainable against both the State (public authorities) and private individuals.',
              hindiExplanation:
                'बंदी प्रत्यक्षीकरण (Habeas Corpus) का शाब्दिक अर्थ है "शरीर को प्रस्तुत किया जाए"। यह व्यक्तिगत स्वतंत्रता की रक्षा करने वाली सबसे महत्वपूर्ण रिट है और इसे सरकारी अधिकारियों (सार्वजनिक प्राधिकरण) तथा निजी व्यक्तियों—दोनों के विरुद्ध जारी किया जा सकता है।',
              keyPoints: [
                'Habeas Corpus applies against both public authorities and private individuals.',
                'Mandamus, Prohibition, and Certiorari cannot be issued against purely private individuals.',
                'Habeas Corpus does not lie when detention is lawful, for contempt of a legislature/court, or by a competent court.',
              ],
              examRelevantInfo:
                'In prelims matching questions, remember that Quo Warranto is the only writ where any public-spirited citizen (even if not personally aggrieved) has locus standi to challenge an illegal usurpation of public office.',
              incorrectOptions: [
                {
                  option: 'A',
                  reason:
                    'Mandamus ("we command") is issued only to public officials, bodies, or inferior courts to perform a mandatory public duty—never against private individuals.',
                  hindiReason:
                    'परमादेश (Mandamus) केवल सार्वजनिक अधिकारियों या निकायों को अपने संवैधानिक कर्तव्य का पालन करने के लिए जारी किया जाता है, निजी व्यक्तियों के विरुद्ध नहीं।',
                },
                {
                  option: 'B',
                  reason:
                    'Certiorari ("to be certified") is issued by a higher court to a lower court or tribunal to quash an order passed without jurisdiction.',
                  hindiReason:
                    'उत्प्रेषण (Certiorari) उच्च न्यायालय द्वारा निचली अदालतों या अधिकरणों के आदेश को रद्द करने के लिए जारी किया जाता है।',
                },
                {
                  option: 'D',
                  reason:
                    'Quo Warranto ("by what authority") challenges the legality of a person holding a substantive public office.',
                  hindiReason:
                    'अधिकार-पृच्छा (Quo Warranto) किसी सार्वजनिक पद पर किसी व्यक्ति के दावे की वैधता की जांच करने के लिए जारी किया जाता है।',
                },
              ],
              sourceExcerpt:
                'Habeas Corpus ("to have the body of") is issued to release a person who has been unlawfully detained, whether by public authorities or private individuals.',
              additionalInfo:
                'Note that under Article 32 the Supreme Court can issue writs ONLY for the enforcement of Fundamental Rights, whereas High Courts under Article 226 can issue writs both for Fundamental Rights and "for any other purpose" (ordinary legal rights).',
            },
          },
          {
            id: 'q_const_3',
            questionText:
              'In which landmark Supreme Court judgment was it held that "procedure established by law" under Article 21 must be "fair, just and reasonable", effectively introducing substantive due process into Indian constitutional law?',
            questionHindi:
              'सर्वोच्च न्यायालय के किस ऐतिहासिक निर्णय में यह निर्धारित किया गया कि अनुच्छेद 21 के अंतर्गत "विधि द्वारा स्थापित प्रक्रिया" निष्पक्ष, न्यायपूर्ण और तर्कसंगत होनी चाहिए?',
            options: {
              A: 'A.K. Gopalan v. State of Madras (1950)',
              B: 'Maneka Gandhi v. Union of India (1978)',
              C: 'Champakam Dorairajan v. State of Madras (1951)',
              D: 'Berubari Union Case (1960)',
            },
            correctOption: 'B',
            topicTag: 'Constitutional Writs & Rights',
            difficulty: 'Moderate',
            teacher: {
              detailedSolution:
                'In Maneka Gandhi v. Union of India (1978), the Supreme Court overruled its narrow reading in A.K. Gopalan (1950) and held that Articles 14, 19, and 21 are not watertight compartments ("Golden Triangle"). Any procedure depriving a person of personal liberty under Article 21 must be fair, just, and reasonable, not arbitrary or fanciful.',
              hindiExplanation:
                'मेनका गांधी बनाम भारत संघ (1978) मामले में सर्वोच्च न्यायालय ने ए.के. गोपालन (1950) के संकीर्ण निर्णय को पलटते हुए कहा कि अनुच्छेद 21 के तहत "विधि द्वारा स्थापित प्रक्रिया" मनमानी नहीं हो सकती—उसे निष्पक्ष, न्यायसंगत और तार्किक (fair, just and reasonable) होना चाहिए। इसने अनुच्छेद 14, 19 और 21 के "स्वर्णिम त्रिभुज" (Golden Triangle) सिद्धांत को स्थापित किया।',
              keyPoints: [
                'Maneka Gandhi (1978) linked Articles 14, 19, and 21 into the Golden Triangle.',
                'Overruled A.K. Gopalan (1950) which protected only against arbitrary executive action, not arbitrary legislative procedure.',
                'Expanded Article 21 to encompass right to live with human dignity, privacy, clean environment, and speedy trial.',
              ],
              examRelevantInfo:
                'Articles 14, 19, and 21 are collectively called the "Golden Triangle of the Indian Constitution" because any law restricting personal liberty must simultaneously pass the tests of equality (Art. 14) and reasonableness (Art. 19).',
              incorrectOptions: [
                {
                  option: 'A',
                  reason:
                    'A.K. Gopalan (1950) took a narrow positivist view that any law enacted by Parliament satisfied Article 21 regardless of fairness.',
                  hindiReason:
                    'ए.के. गोपालन (1950) में न्यायालय ने संकीर्ण दृष्टिकोण अपनाया था, जिसे बाद में मेनका गांधी मामले में पलट दिया गया।',
                },
                {
                  option: 'C',
                  reason:
                    'Champakam Dorairajan (1951) dealt with reservations in educational institutions and led to the First Constitutional Amendment Act.',
                  hindiReason:
                    'चंपकम दोरईराजन (1951) मामला शैक्षणिक संस्थानों में आरक्षण और पहले संविधान संशोधन से संबंधित था।',
                },
                {
                  option: 'D',
                  reason:
                    'Berubari Union (1960) examined whether the Preamble is part of the Constitution and the cession of Indian territory under Article 368.',
                  hindiReason:
                    'बेरुबारी यूनियन (1960) मामला प्रस्तावना की स्थिति और भारतीय क्षेत्र के हस्तांतरण से संबंधित था।',
                },
              ],
              sourceExcerpt:
                'Following the Maneka Gandhi v. Union of India (1978) judgment, "procedure established by law" must be fair, just, and reasonable.',
              additionalInfo:
                'In Justice K.S. Puttaswamy v. Union of India (2017), a 9-judge bench unanimously reaffirmed Maneka Gandhi and declared the Right to Privacy an intrinsic part of Article 21.',
            },
          },
          {
            id: 'q_const_4',
            questionText:
              'Which writ literally means "By what authority or warrant" and is used to prevent illegal usurpation of a substantive public office?',
            questionHindi:
              'किस रिट का शाब्दिक अर्थ "किस प्राधिकार या वारंट से" है और इसका उपयोग किसी सार्वजनिक पद के अवैध रूप से ग्रहण करने को रोकने के लिए किया जाता है?',
            options: {
              A: 'Prohibition',
              B: 'Certiorari',
              C: 'Quo Warranto',
              D: 'Mandamus',
            },
            correctOption: 'C',
            topicTag: 'Constitutional Writs & Rights',
            difficulty: 'Easy',
            teacher: {
              detailedSolution:
                'Quo Warranto literally translates to "by what authority or warrant". It is issued by the court to enquire into the legality of a person’s claim to a substantive public office created by a statute or the Constitution.',
              hindiExplanation:
                'अधिकार-पृच्छा (Quo Warranto) का शाब्दिक अर्थ है "किस अधिकार या वारंट से"। न्यायालय द्वारा यह रिट किसी व्यक्ति द्वारा किसी संवैधानिक या वैधानिक सार्वजनिक पद पर किए गए दावे की वैधता की जांच करने के लिए जारी की जाती है। यदि पद ग्रहण अवैध पाया जाता है, तो न्यायालय उसे पद से हटा सकता है।',
              keyPoints: [
                'Quo Warranto = "By what authority or warrant".',
                'Applies only to substantive public offices of a permanent character created by statute or the Constitution.',
                'Cannot be issued against ministerial or private offices.',
              ],
              examRelevantInfo:
                'Unlike the other four writs which can only be sought by the aggrieved party (except Habeas Corpus in representing detainees), Quo Warranto can be sought by any interested member of the public.',
              incorrectOptions: [
                {
                  option: 'A',
                  reason:
                    'Prohibition ("to forbid") is issued by a higher court to a lower court or tribunal to prevent it from exceeding its jurisdiction.',
                  hindiReason:
                    'प्रतिषेध (Prohibition) उच्च न्यायालय द्वारा निचली अदालत को अपने अधिकार क्षेत्र से बाहर जाने से रोकने के लिए जारी किया जाता है।',
                },
                {
                  option: 'B',
                  reason:
                    'Certiorari both prevents and quashes an already issued order of an inferior court or tribunal acting without jurisdiction.',
                  hindiReason:
                    'उत्प्रेषण (Certiorari) निचली अदालत या अधिकरण द्वारा पहले से पारित अवैध आदेश को रद्द करने के लिए जारी किया जाता है।',
                },
                {
                  option: 'D',
                  reason:
                    'Mandamus ("we command") directs a public official to perform a mandatory statutory duty.',
                  hindiReason:
                    'परमादेश (Mandamus) किसी सार्वजनिक अधिकारी को उसके कानूनी कर्तव्य का पालन करने का आदेश देता है।',
                },
              ],
              sourceExcerpt:
                'Quo Warranto ("by what authority or warrant") is issued by the court to enquire into the legality of claim of a person to a public office.',
              additionalInfo:
                'Remember the quick pair: Prohibition is "prevention before final order", while Certiorari is "cure (quashing) after the order is pronounced".',
            },
          },
        ],
        attempts: [
          {
            id: 'attempt_init_1',
            attemptNumber: 1,
            completedAt: twoDaysAgo,
            durationSeconds: 310,
            score: 2,
            totalQuestions: 4,
            accuracyPercent: 50,
            answers: {
              q_const_1: 'A',
              q_const_2: 'C',
              q_const_3: 'B',
              q_const_4: 'A',
            },
            randomizedQuestionsUsed: false,
            randomizedOptionsUsed: false,
          },
          {
            id: 'attempt_init_2',
            attemptNumber: 2,
            completedAt: yesterday,
            durationSeconds: 215,
            score: 3,
            totalQuestions: 4,
            accuracyPercent: 75,
            answers: {
              q_const_1: 'B',
              q_const_2: 'C',
              q_const_3: 'B',
              q_const_4: 'A',
            },
            randomizedQuestionsUsed: true,
            randomizedOptionsUsed: false,
          },
        ],
      },
      {
        id: 'test_physics_optics_02',
        title: 'Applied Optics, TIR & Lens Power Practice Test',
        sourceDocumentId: 'doc_optics_thermodynamics',
        sourceDocumentTitle: 'Applied Physics & Everyday Science — Camera Scan',
        createdAt: yesterday,
        isTimed: false,
        timeLimitMinutes: 15,
        randomizeQuestions: false,
        randomizeOptions: false,
        questions: [
          {
            id: 'q_phys_1',
            questionText:
              'Which two conditions are strictly required for Total Internal Reflection (TIR) of light to take place?',
            questionHindi:
              'प्रकाश के पूर्ण आंतरिक परावर्तन (Total Internal Reflection - TIR) के होने के लिए कौन-सी दो शर्तें अनिवार्य हैं?',
            options: {
              A: 'Light must travel from rarer to denser medium, and angle of incidence must be less than critical angle.',
              B: 'Light must travel from denser to rarer medium, and angle of incidence must be greater than critical angle.',
              C: 'Light must travel between two media of equal refractive index at 45 degrees.',
              D: 'Wavelength of light must exceed 700 nm in vacuum.',
            },
            correctOption: 'B',
            topicTag: 'Applied Optics & Physics',
            difficulty: 'Easy',
            teacher: {
              detailedSolution:
                'Total Internal Reflection occurs ONLY when (1) light rays travel from an optically denser medium (higher refractive index n1) toward an optically rarer medium (lower refractive index n2), and (2) the angle of incidence in the denser medium exceeds the critical angle (θi > θc).',
              hindiExplanation:
                'पूर्ण आंतरिक परावर्तन (TIR) केवल तभी होता है जब: (1) प्रकाश किरण सघन माध्यम (अधिक अपवर्तनांक) से विरल माध्यम (कम अपवर्तनांक) की ओर गमन करती है, और (2) आपतन कोण (angle of incidence) का मान क्रांतिक कोण (critical angle) से अधिक होता है।',
              keyPoints: [
                'Condition 1: Denser medium → Rarer medium (n1 > n2).',
                'Condition 2: Angle of incidence > Critical angle (θi > θc).',
                'Applications: Optical fiber communication, endoscopy, diamond sparkle, desert/highway mirage.',
              ],
              examRelevantInfo:
                'At the exact critical angle (θi = θc), the refracted ray grazes the interface between the two media at an angle of refraction of 90°.',
              incorrectOptions: [
                {
                  option: 'A',
                  reason:
                    'When light travels from rarer to denser medium, it bends toward the normal and can never undergo Total Internal Reflection.',
                  hindiReason:
                    'जब प्रकाश विरल से सघन माध्यम में जाता है, तो वह अभिलंब की ओर झुकता है और कभी भी पूर्ण आंतरिक परावर्तन नहीं कर सकता।',
                },
                {
                  option: 'C',
                  reason:
                    'Equal refractive indices result in no refraction or reflection at the boundary.',
                  hindiReason:
                    'समान अपवर्तनांक होने पर सीमा पर कोई अपवर्तन या परावर्तन नहीं होता।',
                },
                {
                  option: 'D',
                  reason:
                    'TIR can occur for any visible wavelength provided the medium and angle conditions are met.',
                  hindiReason:
                    'शर्तें पूरी होने पर किसी भी दृश्य तरंगदैर्ध्य के लिए पूर्ण आंतरिक परावर्तन हो सकता है।',
                },
              ],
              sourceExcerpt:
                'Total Internal Reflection (TIR) occurs when light travels from an optically denser medium (higher refractive index n1) to an optically rarer medium (lower refractive index n2) and the angle of incidence exceeds the critical angle.',
              additionalInfo:
                'Critical angle formula: sin(θc) = n2 / n1. Diamond has a very high refractive index (n ≈ 2.42), giving it a very small critical angle (~24.4°), trapping light inside for brilliant sparkle.',
            },
          },
          {
            id: 'q_phys_2',
            questionText:
              'A corrective lens has a focal length of -50 cm. What is its optical power and which vision defect does it correct?',
            questionHindi:
              'एक सुधारात्मक लेंस की फोकस दूरी -50 सेमी है। इसकी प्रकाशीय क्षमता (Power) क्या है और यह किस दृष्टि दोष को ठीक करता है?',
            options: {
              A: '+2.0 Dioptre; corrects Hypermetropia',
              B: '-2.0 Dioptre; corrects Myopia',
              C: '-0.5 Dioptre; corrects Presbyopia',
              D: '+0.5 Dioptre; corrects Astigmatism',
            },
            correctOption: 'B',
            topicTag: 'Applied Optics & Physics',
            difficulty: 'Moderate',
            teacher: {
              detailedSolution:
                'First convert focal length from centimeters to meters: f = -50 cm = -0.50 m. Lens power P = 1 / f(in meters) = 1 / (-0.50) = -2.0 Dioptre (-2.0 D). Negative power indicates a diverging (concave) lens, which is used to correct Myopia (nearsightedness).',
              hindiExplanation:
                'सबसे पहले फोकस दूरी को सेंटीमीटर से मीटर में बदलें: f = -50 सेमी = -0.50 मीटर। लेंस की क्षमता का सूत्र है P = 1 / f (मीटर में) = 1 / (-0.50) = -2.0 डायोप्टर (-2.0 D)। ऋणात्मक (-) चिह्न अवतल लेंस (concave lens) को दर्शाता है, जिसका उपयोग निकट दृष्टि दोष (Myopia) के निवारण के लिए किया जाता है।',
              keyPoints: [
                'Always convert focal length to meters before computing Dioptres: P = 100 / f(cm).',
                'Negative power (-D) = Concave (diverging) lens → corrects Myopia (nearsightedness).',
                'Positive power (+D) = Convex (converging) lens → corrects Hypermetropia (farsightedness).',
              ],
              examRelevantInfo:
                'In Myopia, the eyeball is elongated or the eye lens is too converging, so the image of distant objects forms in FRONT of the retina. A concave lens diverges incoming rays so they focus cleanly on the retina.',
              incorrectOptions: [
                {
                  option: 'A',
                  reason:
                    'Uses a positive sign (+2.0 D); a convex lens with +50 cm focal length corrects Hypermetropia.',
                  hindiReason:
                    'इसमें धनात्मक चिह्न (+2.0 D) है जो उत्तल लेंस और दूर दृष्टि दोष (Hypermetropia) के लिए होता है।',
                },
                {
                  option: 'C',
                  reason:
                    'Forgets to invert 0.5 m (1 / 0.5 = 2.0, not 0.5).',
                  hindiReason:
                    'यहाँ 1 / 0.5 का व्युत्क्रम नहीं लिया गया है (1 / 0.5 = 2.0 होता है, 0.5 नहीं)।',
                },
                {
                  option: 'D',
                  reason:
                    'Astigmatism is corrected using cylindrical lenses, and the magnitude/sign are both incorrect.',
                  hindiReason:
                    'अबिंदुकता (Astigmatism) को बेलनाकार लेंस से ठीक किया जाता है तथा मान और चिह्न दोनों गलत हैं।',
                },
              ],
              sourceExcerpt:
                'The power of a lens (P) is the reciprocal of its focal length in meters: P = 1 / f(m), measured in Dioptres (D)... a diverging (concave) lens has negative power (-D) and corrects myopia (nearsightedness).',
              additionalInfo:
                'When two thin lenses of powers P1 and P2 are kept in contact, the combined power is simply the algebraic sum: P_total = P1 + P2.',
            },
          },
          {
            id: 'q_phys_3',
            questionText:
              'According to Rayleigh’s law of scattering, how does the intensity of scattered light (I) depend on the wavelength (λ) of incident light?',
            questionHindi:
              'रैले के प्रकीर्णन नियम (Rayleigh scattering) के अनुसार, प्रकीर्णित प्रकाश की तीव्रता (I) आपतित प्रकाश के तरंगदैर्ध्य (λ) पर किस प्रकार निर्भर करती है?',
            options: {
              A: 'Directly proportional to λ^2',
              B: 'Inversely proportional to λ',
              C: 'Inversely proportional to λ^4',
              D: 'Directly proportional to λ^4',
            },
            correctOption: 'C',
            topicTag: 'Applied Optics & Physics',
            difficulty: 'Easy',
            teacher: {
              detailedSolution:
                'Rayleigh scattering establishes that when scattering particles (air molecules) are much smaller than the wavelength of light, scattered intensity is inversely proportional to the fourth power of wavelength (I ∝ 1/λ^4).',
              hindiExplanation:
                'रैले के प्रकीर्णन नियम के अनुसार, प्रकीर्णित प्रकाश की तीव्रता (I) प्रकाश के तरंगदैर्ध्य (λ) की चौथी घात के व्युत्क्रमानुपाती होती है (I ∝ 1/λ^4)। चूँकि नीले रंग का तरंगदैर्ध्य लाल रंग की तुलना में कम होता है, इसलिए नीले प्रकाश का प्रकीर्णन सबसे अधिक होता है और आकाश नीला दिखाई देता है।',
              keyPoints: [
                'Rayleigh law: Intensity I ∝ 1 / λ^4.',
                'Blue light (~450 nm) scatters nearly 6–9 times more strongly than red light (~650–700 nm).',
                'Red light scatters least, allowing it to penetrate fog and haze—making it ideal for danger & stop signals.',
              ],
              examRelevantInfo:
                'Clouds appear white because water droplets in clouds are much larger than the wavelength of visible light, so all wavelengths scatter almost equally (Mie scattering).',
              incorrectOptions: [
                {
                  option: 'A',
                  reason:
                    'If intensity were proportional to λ^2, longer wavelengths (red) would scatter more and the sky would appear red all day.',
                  hindiReason:
                    'यदि तीव्रता λ^2 के समानुपाती होती, तो लाल रंग अधिक फैलता और दिन में आकाश लाल दिखाई देता।',
                },
                {
                  option: 'B',
                  reason:
                    'Inverse first power (1/λ) understates the strong fourth-power wavelength dependence.',
                  hindiReason:
                    '1/λ प्रकीर्णन की चौथी घात (1/λ^4) के तीव्र प्रभाव को सही रूप से व्यक्त नहीं करता।',
                },
                {
                  option: 'D',
                  reason:
                    'Reverses the inverse relationship into a direct fourth-power relationship.',
                  hindiReason:
                    'यह व्युत्क्रमानुपाती संबंध को उल्टा करके समानुपाती बताता है।',
                },
              ],
              sourceExcerpt:
                'Rayleigh scattering states that the intensity of scattered light is inversely proportional to the fourth power of wavelength (I ∝ 1/λ^4).',
              additionalInfo:
                'In the absence of an atmosphere (e.g. on the Moon or in outer space), no scattering occurs and the sky appears pitch black even during daytime.',
            },
          },
        ],
        attempts: [
          {
            id: 'attempt_phys_1',
            attemptNumber: 1,
            completedAt: yesterday,
            durationSeconds: 185,
            score: 1,
            totalQuestions: 3,
            accuracyPercent: 33,
            answers: {
              q_phys_1: 'B',
              q_phys_2: 'A',
              q_phys_3: 'B',
            },
            randomizedQuestionsUsed: false,
            randomizedOptionsUsed: false,
          },
        ],
      },
    ],
    dailyTasks: [
      {
        id: 'task_1',
        title: 'Complete Retake #3 of Fundamental Rights & Writs Test (Target 100%)',
        date: today,
        targetMinutes: 25,
        completed: false,
        priority: 'High',
      },
      {
        id: 'task_2',
        title: 'Review AI Teacher Hindi Explanations for Lens Power & Rayleigh Scattering',
        date: today,
        targetMinutes: 35,
        completed: true,
        priority: 'High',
      },
      {
        id: 'task_3',
        title: 'Scan & OCR 2 new practice handout pages and generate a 5-question timed test',
        date: today,
        targetMinutes: 40,
        completed: false,
        priority: 'Medium',
      },
    ],
    studyLogs: [
      {
        id: 'log_today_1',
        date: today,
        hours: 3.5,
        note: 'Morning constitutional writs analysis & AI Teacher solution drill',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'log_yest_1',
        date: yesterday,
        hours: 5.5,
        note: 'Optics camera scan OCR + 2 mock test attempts',
        createdAt: yesterday,
      },
      {
        id: 'log_2d_1',
        date: twoDaysAgo,
        hours: 6.0,
        note: 'Fundamental Rights PDF upload & baseline diagnostic',
        createdAt: twoDaysAgo,
      },
      {
        id: 'log_3d_1',
        date: threeDaysAgo,
        hours: 4.5,
        note: 'Analytical reasoning timed question sets',
        createdAt: threeDaysAgo,
      },
      {
        id: 'log_4d_1',
        date: fourDaysAgo,
        hours: 5.0,
        note: 'Full-length sectional practice & error log analysis',
        createdAt: fourDaysAgo,
      },
    ],
    weeklySchedule: [
      {
        id: 'slot_mon',
        day: 'Mon',
        timeRange: '06:30 – 09:30 & 18:00 – 21:00',
        activity: 'Document OCR Upload + 2 Timed MCQ Tests + AI Teacher Review',
        targetHours: 6,
        active: true,
      },
      {
        id: 'slot_tue',
        day: 'Tue',
        timeRange: '06:30 – 09:30 & 18:00 – 21:00',
        activity: 'Weak Topic Retake Drills (Attempts 2–4) + Error Analysis',
        targetHours: 6,
        active: true,
      },
      {
        id: 'slot_wed',
        day: 'Wed',
        timeRange: '07:00 – 10:00 & 19:00 – 22:00',
        activity: 'Camera Scan Handouts + New AI Test Generation',
        targetHours: 6,
        active: true,
      },
      {
        id: 'slot_thu',
        day: 'Thu',
        timeRange: '06:30 – 09:30 & 18:30 – 21:30',
        activity: 'Timed Speed Test + Incorrect Option Explanations Drill',
        targetHours: 6,
        active: true,
      },
      {
        id: 'slot_fri',
        day: 'Fri',
        timeRange: '06:30 – 09:30 & 18:00 – 21:00',
        activity: 'High-Difficulty Question Bank + Hindi Concept Clarification',
        targetHours: 6,
        active: true,
      },
      {
        id: 'slot_sat',
        day: 'Sat',
        timeRange: '08:00 – 12:30 & 16:00 – 19:00',
        activity: 'Weekly Full-Length Assessment + Attempt Comparison Audit',
        targetHours: 7.5,
        active: true,
      },
      {
        id: 'slot_sun',
        day: 'Sun',
        timeRange: '08:30 – 12:30',
        activity: 'Milestone Check + Google Drive Cloud Backup & Weekly Planning',
        targetHours: 4,
        active: true,
      },
    ],
    trackerCategories: [
      {
        id: 'cat_daily_hours',
        name: 'Daily Study Hours',
        unit: 'hrs',
        targetValue: 6,
        autoMetric: 'daily_study_hours',
        manualAdjustment: 0,
        currentValue: 3.5,
        hidden: false,
        order: 1,
        period: 'Daily',
      },
      {
        id: 'cat_weekly_hours',
        name: 'Weekly Study Hours (7-Day)',
        unit: 'hrs',
        targetValue: 38,
        autoMetric: 'weekly_study_hours',
        manualAdjustment: 0,
        currentValue: 24.5,
        hidden: false,
        order: 2,
        period: 'Weekly',
      },
      {
        id: 'cat_tests_done',
        name: 'Completed AI Tests',
        unit: 'tests',
        targetValue: 10,
        autoMetric: 'tests_completed',
        manualAdjustment: 0,
        currentValue: 2,
        hidden: false,
        order: 3,
        period: 'Monthly',
      },
      {
        id: 'cat_total_attempts',
        name: 'Total Test Attempts & Retakes',
        unit: 'attempts',
        targetValue: 25,
        autoMetric: 'total_attempts',
        manualAdjustment: 0,
        currentValue: 3,
        hidden: false,
        order: 4,
        period: 'Monthly',
      },
      {
        id: 'cat_avg_accuracy',
        name: 'Average Test Accuracy',
        unit: '%',
        targetValue: 85,
        autoMetric: 'average_accuracy',
        manualAdjustment: 0,
        currentValue: 53,
        hidden: false,
        order: 5,
        period: 'Overall',
      },
      {
        id: 'cat_custom_pyq',
        name: 'Previous Year Questions Solved',
        unit: 'Q',
        targetValue: 200,
        autoMetric: 'custom_manual',
        manualAdjustment: 135,
        currentValue: 135,
        hidden: false,
        order: 6,
        period: 'Monthly',
      },
    ],
    milestones: [
      {
        id: 'ms_1',
        title: 'Reach 85%+ accuracy on all uploaded Constitutional Writs tests',
        targetDate: '2026-11-15',
        completed: false,
      },
      {
        id: 'ms_2',
        title: 'Complete initial diagnostic & set personalized daily study schedule',
        targetDate: today,
        completed: true,
      },
      {
        id: 'ms_3',
        title: 'Maintain 35+ study hours per week for 4 consecutive weeks',
        targetDate: '2026-11-30',
        completed: false,
      },
    ],
    customStrongAreas: ['Article 21 & Writs Jurisdiction'],
    customWeakAreas: ['Sign Convention in Lens Power Calculations'],
  };

  baseState.trackerCategories = syncTrackerCategoriesWithActivity(
    baseState.trackerCategories,
    baseState
  );

  return baseState;
}
