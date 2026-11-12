# Prompts used for ad 03

All stills: aspect_ratio 9:16, resolution 1K, output_format jpeg. All clips: MiniMax H3, 768P, duration 5.

## Hero still (h1), text to image, seed 7
Candid photo snapped on a phone by her husband from across the kitchen, framing slightly off-level. A woman in her mid-thirties stands in a lived-in suburban American kitchen in the late afternoon, wondering what to cook for dinner: one hand resting against her chin, the other hand on her hip, looking off to the side toward the open pantry cupboard with a tired, slightly amused expression. Shoulder-length dark brown wavy hair, a little messy at the end of the day. Mustard-yellow knit sweater with slight pilling, everyday jeans. Honey oak cabinets, a white fridge with a few magnets and a child's crayon drawing, speckled laminate counter with a dish rack, a coffee maker, a pile of mail and a bowl of bananas. Bright room: plenty of daylight from the window on camera right plus a warm ceiling light overhead. Natural unretouched skin with visible pores, faint under-eye shadows and a few flyaway hairs. Phone camera look: 24mm wide lens, the whole kitchen in focus, slight noise in the shadows, neutral true-to-life colour straight out of the phone.

## Edits from the hero (h2, h3, c1, p1)
Each ends with: "Same candid phone-snapshot look: 24mm phone lens, everything in focus, neutral true-to-life colour, slight noise, natural unretouched skin."
- h2: Same woman, same kitchen, same camera position, a few seconds later. She has taken her smartphone out and holds it in both hands at chest height, looking down at the screen with a slightly stuck, thinking expression, lips pressed to one side. Keep her face, hair, sweater, jeans, the kitchen and everything on the counters exactly the same.
- h3: Same woman, same kitchen. She has walked over to the open pantry doorway and stands in front of the shelves, seen from behind and slightly to the side, holding her smartphone up in one hand to take a photo of the pantry shelves; the phone screen shows the shelves. The shelves are half stocked with gaps: cans, boxes of pasta, a bag of rice, jars. Photo taken by her husband from the kitchen. Keep her hair, sweater, jeans and the kitchen the same.
- p1: A close photo taken on her phone looking straight into the same pantry from an arm's length away: two white wire shelves fill the frame, half stocked with gaps between things. Upper shelf: an opened box of penne pasta, two cans of crushed tomatoes with plain red store-brand labels, a head of garlic, a small jar of dried basil. Lower shelf: a half-empty bag of white rice with the top rolled down, a can of black beans, a jar of salsa, two yellow onions. A little dust on the wire, a stray twist tie. Flat overhead pantry light, slightly yellow. No person in the frame.
- p1f (from p1): Same photo, one change: the pasta box is a plain brown kraft cardboard store-brand box with a small clear window showing the penne and only the single word PENNE printed in simple black letters. Everything else stays exactly the same.
- c1: The same woman, later that evening, sitting curled up on a lived-in living room couch with a knit throw blanket, a TV remote and a kid's stuffed toy on the cushion beside her, holding her smartphone in one hand and watching something on it with mild interest. A floor lamp is on and there is still daylight from a window, so the room is bright. Candid photo snapped on a phone by her husband from the armchair across the room, framing slightly off-level. Keep her face, hair and mustard sweater the same.

## Re-photograph a crop (h2x from a crop of h2c; cx from a crop of c1c)
Crop the wide still to the framing the cut needs, enlarge it to 768x1376, then:

Edit the attached reference image. It is a soft enlargement of a phone photo; re-photograph the same moment from where this crop stands, about three feet from her, at her eye level.
COMPOSITION: unchanged. [who fills the frame, pose, what stays behind her]
PHYSICAL CONSTRUCTION: real skin with uneven tone, fine lines at the eyes, a few flyaway hairs; a knit mustard sweater with visible stitch rows and slight pilling; a phone with a glass back and metal rim.
LIGHT AND SURFACE: the same warm ceiling fixture above and cooler window daylight from camera right; soft shadow under her chin and hands; matte skin with no shine.
PHOTOGRAPHIC CHARACTER: phone camera, everything in focus, true-to-life colour, slight sensor noise, natural detail without sharpening.
Preserve: her face and identity, hair, sweater, jeans, pose, the kitchen behind her.
Success: at phone size it reads as a casual photo of a real woman stuck on a decision.

## Expression and pose edits (from h2x and cx)
Template: "Edit the attached reference image. Change only: ... Preserve: her face and identity, hair, sweater, the framing, the room behind her, the lighting and the phone-photo look. Do not redesign anything."
- h5x (AH HAH): her expression and hands, one second later. She has just read the answer on her phone: eyebrows up, eyes wide and bright, mouth open in a real surprised laugh, head lifting a little from the phone, one hand coming off the phone with fingers spread and slightly motion-blurred. Real teeth, real laugh lines at the eyes.
- h6x (relief): her expression and pose, a few seconds later: relief. Shoulders dropped, head tipped back a little, eyes closed, a big exhale turning into a laugh, the phone pressed flat against her chest with one hand, the other hand loose at her side.
- c2x: her pose and expression, a moment later: the phone lies on her lap, she has leaned back deep into the cushions with her head resting back, eyes closed, a small satisfied smile, one hand behind her head.

## Shelf edits
- pA (from p1f): Same photo, one change: everything that was standing on the upper shelf (the pasta box, the two cans, the garlic, the jar) is gone and in its place sits one ordinary white dinner plate of home-cooked penne in chunky tomato sauce with a little torn basil and grated cheese, a fork resting on the rim, a few sauce smears on the plate. The lower shelf and the wire shelving stay exactly the same.
- pA3 (seed 21): Change only: on the upper shelf, to the left of the plate, a flat brown piece of cardboard leans against the wall. Erase that brown cardboard completely so only the bare cream-coloured wall and the white wire shelf are visible there. The upper shelf then holds exactly one thing: the plate of penne with its fork. Preserve: the plate, pasta, fork, wire shelving, everything on the lower shelf, the lighting and the phone-photo look.
- pB3 (from pA3): Change only: everything standing on the lower shelf (the bag of rice, the can, the jar, the onions) is replaced by one ordinary ceramic bowl of white rice topped with black beans, salsa and browned onions, with a spoon in it, casting a soft shadow on the wire shelf and wall. Preserve: the upper shelf exactly as it is, the wire shelving, the wall, the lighting and the phone-photo look. Do not add anything else.

## Clips
Every prompt ends with: "Phone video on a tripod: the camera does not move at all, the room and everything in it stay exactly as they are. Natural real-time movement. Quiet room sound, no speech."
- v1 (h1 to h2): A woman in her kitchen wonders what to make for dinner. She drops her hand from her chin with a small sigh, pulls her phone out of her back pocket and looks down at it.
- v2 (h3): The woman standing at the pantry holds her phone up, taps the screen once to take a photo of the shelves, then lowers the phone slightly to look at it.
- v3x (p1f to pA3): Pantry shelf. The pasta box, cans, garlic and jar on the upper shelf slide together, blur and transform in one smooth magical motion into a plate of cooked penne in tomato sauce. The lower shelf does not change.
- v4x (pA3 to pB3): Pantry shelf. The bag of rice, can, jar and onions on the lower shelf slide together, blur and transform in one smooth magical motion into a bowl of rice and beans. The plate of pasta on the upper shelf does not change.
- v5x (h2x to h5x): The woman reads her phone, stuck, frowning. Then the answer lands: her eyebrows shoot up, her eyes go wide and she breaks into a surprised, delighted laugh, lifting her head, one hand coming off the phone. Her face stays toward the camera.
- v6x (h5x to h6x): The woman, delighted, laughs, then lets out a long relieved breath: her shoulders drop, her head tips back, her eyes close, and she presses the phone flat to her chest, still smiling. Her face stays toward the camera.
- v7x (cx): The woman on the couch scrolls her phone with her thumb, stops, raises her eyebrows with interest, smiles a little and taps the screen twice.
- v8x (cx to c2x): The woman on the couch smiles at her phone, sets it down on her lap, leans back deep into the cushions, puts one hand behind her head and closes her eyes with a satisfied smile.
