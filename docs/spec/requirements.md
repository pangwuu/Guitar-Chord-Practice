# Requirements Document

## Introduction

The Fretboard Theory Workbench is a new mode within the existing Guitar Chord Practice app that unifies fretboard visualization, music theory analysis, and multi-position exploration into a single interactive tool. It bridges the gap no free web tool currently fills: connecting "here's a song" → "here's the theory" → "here are multiple ways to play it across the neck." The feature targets guitar learners who want to understand WHY certain chords work together, not just WHERE to put their fingers.

The workbench extends the existing React/TypeScript/Vite/Tailwind/shadcn/Tone.js stack, reusing the current fretboard visualizer and audio playback infrastructure.

## Glossary

- **Workbench**: The main application view that hosts the fretboard visualizer, theory panel, and song analysis features as an integrated workspace
- **Fretboard_Visualizer**: The interactive SVG/Canvas guitar neck component that renders note positions, intervals, and fingering patterns with color coding
- **Theory_Engine**: The core music theory computation module that calculates scales, modes, intervals, chord construction, and harmonic relationships
- **Song_Analyzer**: The module that accepts chord progressions as input and derives key, scale, chord functions (Roman numeral analysis), and related theory
- **Position_Explorer**: The component that generates and displays multiple voicings, inversions, and CAGED system positions for any chord or scale pattern
- **Chord_Progression**: An ordered sequence of chords representing a song or section of a song, entered as chord symbols (e.g., "Am F C G")
- **Roman_Numeral_Analysis**: A music theory notation system that labels chords by their scale degree (I, ii, iii, IV, V, vi, vii°) to show harmonic function independent of key
- **CAGED_System**: A guitar-specific method of organizing the fretboard into five overlapping position shapes (C, A, G, E, D) that cover the entire neck
- **Interval_Coloring**: A visual scheme that assigns distinct colors to musical intervals (root, minor 3rd, major 3rd, perfect 5th, etc.) on the fretboard
- **Voicing**: A specific arrangement of notes from a chord across the guitar strings, including which strings are played and at which frets
- **Inversion**: A chord voicing where a note other than the root is the lowest-sounding note (first inversion = 3rd in bass, second inversion = 5th in bass)
- **Mode**: A scale derived by starting on a different degree of a parent scale (e.g., Dorian is the second mode of the major scale)
- **Triad**: A three-note chord built by stacking thirds (root, third, fifth), forming the harmonic building block of Western music

## Requirements

### Requirement 1: Scale and Mode Visualization

**User Story:** As a guitar learner, I want to see any scale or mode displayed on the fretboard with interval coloring, so that I can understand the intervallic structure and practice the patterns visually.

#### Acceptance Criteria


1. WHEN a user selects a root note and a scale type, THE Fretboard_Visualizer SHALL display all notes of that scale across the entire fretboard using Interval_Coloring.
2. THE Theory_Engine SHALL support the following scale types: major, natural minor, harmonic minor, melodic minor, major pentatonic, minor pentatonic, and blues scale.
3. THE Theory_Engine SHALL support all seven modes of the major scale: Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, and Locrian.
4. WHEN a scale is displayed, THE Fretboard_Visualizer SHALL distinguish the root notes from other scale degrees using a visually distinct color or marker.
5. WHEN a user hovers over or taps a note on the fretboard, THE Fretboard_Visualizer SHALL display a tooltip showing the note name, interval from root, and scale degree number.
6. THE Fretboard_Visualizer SHALL support display across frets 0 through 24 with standard 6-string guitar tuning (E A D G B E) as the default.
7. WHEN a user selects a different mode of the same parent scale, THE Fretboard_Visualizer SHALL highlight the new root and update the Interval_Coloring to reflect intervals relative to the new mode root.

### Requirement 2: Triad and Chord Shape Visualization

**User Story:** As a guitar learner, I want to see triads and chord shapes displayed on the fretboard, so that I can learn different ways to voice chords and understand their construction.

#### Acceptance Criteria

1. WHEN a user selects a chord type and root note, THE Fretboard_Visualizer SHALL display the chord tones on the fretboard using Interval_Coloring.
2. THE Theory_Engine SHALL support the following chord types: major, minor, diminished, augmented, dominant 7th, major 7th, minor 7th, suspended 2nd, and suspended 4th.
3. WHEN a chord is displayed, THE Fretboard_Visualizer SHALL show the chord formula (e.g., "1 - 3 - 5" for major, "1 - ♭3 - 5" for minor) in a visible label.
4. THE Theory_Engine SHALL compute triad shapes for all four triad types (major, minor, diminished, augmented) on every string group (strings 6-5-4, 5-4-3, 4-3-2, 3-2-1).
5. WHEN a user selects a triad string group, THE Fretboard_Visualizer SHALL highlight only the triad voicing on that string group and dim other notes.

### Requirement 3: Song Chord Progression Input and Parsing

**User Story:** As a guitar learner, I want to input a chord progression from a song, so that the app can analyze the music theory behind it.

#### Acceptance Criteria

1. THE Workbench SHALL provide a text input field that accepts chord progressions in standard chord symbol notation (e.g., "Am F C G", "Dm7 G7 Cmaj7").
2. THE Song_Analyzer SHALL parse chord symbols supporting root notes (A through G), accidentals (♯/# and ♭/b), and quality suffixes (m, maj7, 7, dim, aug, sus2, sus4, m7, add9).
3. IF a chord symbol cannot be parsed, THEN THE Song_Analyzer SHALL display an inline error indicating which symbol is invalid and provide an example of valid notation.
4. THE Song_Analyzer SHALL format parsed chord progressions back into normalized chord symbol notation (round-trip property: parse then format then parse SHALL produce an equivalent chord sequence).
5. WHEN a chord progression is entered, THE Workbench SHALL display each chord as a clickable element in a horizontal progression bar above the fretboard.
6. WHEN a user clicks a chord in the progression bar, THE Fretboard_Visualizer SHALL display that chord on the fretboard.


### Requirement 4: Key and Scale Detection

**User Story:** As a guitar learner, I want the app to detect the key and scale of a chord progression, so that I understand the tonal center of the song.

#### Acceptance Criteria

1. WHEN a chord progression is entered, THE Song_Analyzer SHALL determine the most likely key and scale for the progression.
2. THE Song_Analyzer SHALL use chord-to-scale matching by evaluating which major or minor key contains all or most of the chords in the progression as diatonic chords.
3. WHEN multiple keys are equally plausible, THE Song_Analyzer SHALL rank candidates by likelihood and display the top candidate as the primary result with alternatives listed below.
4. THE Song_Analyzer SHALL display the detected key in the format "[Root] [Scale Type]" (e.g., "C Major", "A Minor").
5. WHEN the detected key is displayed, THE Fretboard_Visualizer SHALL offer a one-click option to overlay the detected scale on the fretboard.
6. IF no key matches the chord progression with at least 75% of chords being diatonic, THEN THE Song_Analyzer SHALL indicate that the progression contains non-diatonic chords and list which chords fall outside the detected key.

### Requirement 5: Roman Numeral Harmonic Analysis

**User Story:** As a guitar learner, I want to see the Roman numeral analysis of a chord progression, so that I understand the harmonic function of each chord.

#### Acceptance Criteria

1. WHEN a key is detected for a chord progression, THE Song_Analyzer SHALL label each chord with its Roman numeral function relative to the detected key.
2. THE Song_Analyzer SHALL use standard Roman numeral conventions: uppercase for major chords (I, IV, V), lowercase for minor chords (ii, iii, vi), and lowercase with degree symbol for diminished chords (vii°).
3. THE Song_Analyzer SHALL display the Roman numeral labels directly above or below each chord in the progression bar.
4. WHEN a chord is non-diatonic to the detected key, THE Song_Analyzer SHALL label the chord with the appropriate borrowed chord notation (e.g., ♭VII, ♯IV) and visually distinguish the label from diatonic chord labels.
5. WHEN a user changes the detected key manually, THE Song_Analyzer SHALL recalculate all Roman numeral labels relative to the new key.
6. THE Song_Analyzer SHALL identify and label common chord functions: tonic (T), subdominant (SD), and dominant (D) for each chord in the progression.

### Requirement 6: Multi-Position Chord Voicings

**User Story:** As a guitar learner, I want to see multiple ways to play any chord across the neck, so that I can learn different voicings and expand my fretboard knowledge.

#### Acceptance Criteria

1. WHEN a chord is selected, THE Position_Explorer SHALL generate at least three distinct voicings for that chord across different fretboard positions.
2. THE Position_Explorer SHALL categorize voicings by CAGED_System position (C shape, A shape, G shape, E shape, D shape) where applicable.
3. WHEN a voicing is selected from the Position_Explorer list, THE Fretboard_Visualizer SHALL display that specific voicing with finger position indicators.
4. THE Position_Explorer SHALL include open chord voicings (using open strings) and barre chord voicings where they exist for the selected chord.
5. WHEN a voicing is displayed, THE Fretboard_Visualizer SHALL indicate which fingers to use (index, middle, ring, pinky) and which strings to mute.
6. THE Position_Explorer SHALL generate inversions (root position, first inversion, second inversion) for triads and display them as separate voicing options.
7. WHEN a user clicks on a displayed voicing, THE Workbench SHALL play the chord audio using the existing Tone.js audio engine.

### Requirement 7: CAGED System Scale Positions

**User Story:** As a guitar learner, I want to see scale patterns organized by CAGED system positions, so that I can learn to navigate the entire fretboard systematically.

#### Acceptance Criteria

1. WHEN a scale is selected, THE Position_Explorer SHALL divide the fretboard into five CAGED_System position zones and display each zone as a selectable option.
2. WHEN a CAGED position is selected, THE Fretboard_Visualizer SHALL highlight only the scale notes within that position's fret range and dim notes outside the position.
3. THE Position_Explorer SHALL display a position map showing all five CAGED positions laid out sequentially across the fretboard, indicating how they connect.
4. WHEN a user navigates between adjacent CAGED positions, THE Fretboard_Visualizer SHALL highlight the overlapping notes shared between the two positions.
5. THE Position_Explorer SHALL label each CAGED position with its shape name (C, A, G, E, D) and the fret range it covers for the selected root note.


### Requirement 8: Unified Theory View — Scale-Chord Relationship

**User Story:** As a guitar learner, I want to see how scales, chords, and modes connect to each other, so that I understand why certain chords belong together in a key.

#### Acceptance Criteria

1. WHEN a key and scale are selected, THE Theory_Engine SHALL compute and display all diatonic triads built from each degree of the scale.
2. THE Workbench SHALL display the diatonic chord table showing: scale degree, chord name, chord quality (major/minor/diminished), and Roman numeral label.
3. WHEN a user clicks a chord in the diatonic chord table, THE Fretboard_Visualizer SHALL display that chord on the fretboard and THE Theory_Engine SHALL highlight the corresponding scale degrees used.
4. WHEN a mode is selected from the diatonic chord table, THE Fretboard_Visualizer SHALL display the mode pattern on the fretboard and THE Theory_Engine SHALL show the mode's characteristic intervals compared to the parent scale.
5. THE Theory_Engine SHALL identify common chord progressions within the selected key (e.g., I-IV-V-I, I-V-vi-IV, ii-V-I) and display them as suggested progressions.
6. WHEN a suggested progression is clicked, THE Song_Analyzer SHALL load the progression into the progression bar and perform full harmonic analysis.

### Requirement 9: Chord Progression Playback

**User Story:** As a guitar learner, I want to hear a chord progression played back, so that I can connect the visual theory with how the music sounds.

#### Acceptance Criteria

1. WHEN a chord progression is loaded, THE Workbench SHALL provide a play button that plays each chord in sequence using the existing Tone.js audio engine.
2. THE Workbench SHALL provide a tempo control (in BPM) that allows the user to set the playback speed, with a default of 80 BPM and a range of 40 to 200 BPM.
3. WHILE a progression is playing, THE Workbench SHALL visually highlight the currently playing chord in the progression bar.
4. WHILE a progression is playing, THE Fretboard_Visualizer SHALL update to show the currently playing chord on the fretboard.
5. THE Workbench SHALL provide stop and loop toggle controls for progression playback.
6. WHEN playback reaches the end of the progression and loop is enabled, THE Workbench SHALL restart playback from the first chord without audible gap.

### Requirement 10: Responsive Layout and Navigation

**User Story:** As a guitar learner, I want the workbench to be usable on both desktop and tablet screens, so that I can use it while practicing with my guitar.

#### Acceptance Criteria

1. THE Workbench SHALL render a usable layout on viewport widths from 768px (tablet) to 1920px (desktop).
2. THE Workbench SHALL organize the interface into three coordinated panels: the fretboard visualization (primary), the theory/analysis panel (secondary), and the progression bar (top).
3. WHEN the viewport width is below 1024px, THE Workbench SHALL stack the theory panel below the fretboard instead of beside it.
4. THE Fretboard_Visualizer SHALL support pinch-to-zoom on touch devices to allow users to zoom into specific fret regions.
5. THE Workbench SHALL integrate into the existing Guitar Chord Practice app as a navigable mode accessible from the main navigation.

### Requirement 11: Left-Handed Mode Support

**User Story:** As a left-handed guitar learner, I want the fretboard to mirror for left-handed orientation, so that the visualization matches my instrument.

#### Acceptance Criteria

1. THE Workbench SHALL respect the existing left-handed mode toggle from the Guitar Chord Practice app.
2. WHEN left-handed mode is enabled, THE Fretboard_Visualizer SHALL mirror the fretboard horizontally so that the nut appears on the right side and fret numbers increase from right to left.
3. WHEN left-handed mode is enabled, THE Fretboard_Visualizer SHALL reverse the string order display so that the lowest-pitched string (E) appears at the bottom in the mirrored view.
4. WHEN left-handed mode is toggled, THE Position_Explorer SHALL update all voicing diagrams to reflect the mirrored orientation.

### Requirement 12: Custom Tuning Support

**User Story:** As a guitar learner, I want to change the tuning of the fretboard, so that I can explore theory in alternate tunings like Drop D or Open G.

#### Acceptance Criteria

1. THE Workbench SHALL provide a tuning selector with preset tunings: Standard (E A D G B E), Drop D (D A D G B E), Open G (D G D G B D), Open D (D A D F# A D), and DADGAD.
2. WHEN a tuning is selected, THE Fretboard_Visualizer SHALL recalculate and display all note positions according to the new tuning.
3. WHEN a tuning is changed, THE Position_Explorer SHALL regenerate all chord voicings and scale positions to reflect the new tuning.
4. THE Workbench SHALL display the current tuning as string labels on the fretboard nut.
5. WHEN a custom tuning is selected, THE Theory_Engine SHALL recalculate triad shapes and chord voicings to account for the altered string intervals.


### Requirement 13: Song Import and Chord Detection

**User Story:** As a guitarist, I want to paste a Spotify or YouTube link and have the app find the chords for that song, so that I can quickly learn and analyze songs I'm listening to.

#### Acceptance Criteria

1. WHEN a user submits a Spotify track URL or YouTube video URL, THE Song_Importer SHALL extract the song title and artist name from the URL metadata.
2. WHEN the song title and artist are identified, THE Chord_Lookup_Service SHALL search existing chord databases (Ultimate Guitar, Chordify, or equivalent open chord databases) for a matching chord chart.
3. IF a chord chart is found in the database, THEN THE Chord_Lookup_Service SHALL return the chord progression with section labels (verse, chorus, bridge, intro, outro).
4. IF no chord chart is found in any database, THEN THE Chord_Lookup_Service SHALL fall back to an audio chord recognition backend (Chord AI, BTC model, or equivalent open-source model) to detect chords from the audio source.
5. IF both database lookup and audio chord recognition fail, THEN THE Song_Importer SHALL display a clear message indicating that chords could not be determined for the given song.
6. WHEN chords are successfully retrieved or detected, THE Chord_Display SHALL render the chord progression organized by song section (verse, chorus, bridge) with chord names displayed above the corresponding section markers.
7. WHEN a song's chords are displayed, THE Song_Importer SHALL provide an option to send the chord progression to the Song Analyzer for theory analysis (key detection, Roman numeral analysis, common progressions identification per Requirements 3-5).
8. WHEN chords are displayed, THE Chord_Editor SHALL allow the user to manually edit, add, remove, or replace any detected chord to correct recognition errors.
9. WHEN the user edits a chord, THE Chord_Editor SHALL update the displayed chord progression and any downstream theory analysis in real time.
10. THE Song_Importer SHALL accept URLs in standard Spotify track link format (open.spotify.com/track/...) and standard YouTube video link format (youtube.com/watch?v=... and youtu.be/...).

### Requirement 14: Guided Learning Path for Beginners

**User Story:** As an absolute beginner guitarist, I want a structured learning path that introduces chords one at a time in a logical order, so that I know exactly what to learn next and can track my progress.

#### Acceptance Criteria

1. THE Learning_Path SHALL present a structured sequence of chords starting with open chords in the following order: Em, Am, E, A, D, C, G, followed by basic barre chord forms (F major, B minor).
2. WHEN a beginner opens the Learning Path, THE Learning_Path SHALL display the current chord to learn, the next chord in the sequence, and overall progress through the path.
3. WHEN a user marks a chord as learned, THE Progress_Tracker SHALL record the completion date and advance the user to the next chord in the sequence.
4. THE Progress_Tracker SHALL persist learning progress across sessions so that returning users resume where they left off.
5. WHILE a chord is the active learning target, THE Learning_Path SHALL display a "Chord of the Day" card showing the chord diagram, finger placement, common songs that use the chord, and a practice tip.
6. WHEN a user completes all open chords in the sequence, THE Learning_Path SHALL introduce barre chord forms with an explanation of the barre technique before presenting the first barre chord.
7. THE Learning_Path SHALL display a visual progress bar or milestone map showing all chords in the sequence with completed, current, and upcoming states clearly distinguished.

### Requirement 15: Finger Placement Guide

**User Story:** As an absolute beginner guitarist, I want step-by-step animated finger placement instructions for each chord, so that I can see exactly which finger goes where instead of guessing from a static diagram.

#### Acceptance Criteria

1. WHEN a user selects a chord in the Finger Placement Guide, THE Finger_Placement_Guide SHALL display an animated or step-by-step sequence showing one finger being placed at a time on the fretboard diagram.
2. THE Finger_Placement_Guide SHALL label each finger placement step with the finger name (index, middle, ring, pinky) and the exact string and fret position (e.g., "Place your index finger on the 1st fret of the B string").
3. THE Finger_Placement_Guide SHALL display at least one common mistake to avoid for each chord (e.g., "Make sure your finger is close to the fret wire, not on top of it" or "Keep your thumb behind the neck, not wrapped over the top").
4. WHEN all fingers are placed in the sequence, THE Finger_Placement_Guide SHALL show the complete chord shape with all fingers highlighted simultaneously.
5. THE Finger_Placement_Guide SHALL allow the user to step forward and backward through the finger placement sequence at their own pace.
6. WHEN a chord requires muted or open strings, THE Finger_Placement_Guide SHALL clearly indicate which strings are strummed open and which strings must not be played, with an explanation of how to mute them.
7. THE Finger_Placement_Guide SHALL use a consistent color-coding scheme to distinguish each finger (index, middle, ring, pinky) across all chord diagrams.

### Requirement 16: Chord Transition Trainer

**User Story:** As a beginner guitarist, I want to practice switching between two chords with a metronome that starts slow and speeds up, so that I can build muscle memory and track my improvement over time.

#### Acceptance Criteria

1. WHEN a user selects two chords for transition practice, THE Chord_Transition_Trainer SHALL display both chord diagrams side by side.
2. WHEN both chords share finger positions that remain the same between the two shapes, THE Chord_Transition_Trainer SHALL highlight those anchor fingers with a distinct visual indicator and label them as "anchor fingers — keep these in place."
3. THE Chord_Transition_Trainer SHALL provide a built-in metronome that defaults to 60 BPM and allows the user to adjust the tempo from 30 BPM to 200 BPM.
4. WHEN the user starts a practice session, THE Chord_Transition_Trainer SHALL alternate a visual cue between the two chords on each beat (or every N beats, configurable by the user) in sync with the metronome.
5. THE Chord_Transition_Trainer SHALL provide a "gradual speed-up" mode that automatically increases the metronome tempo by a configurable BPM increment (default 5 BPM) after a configurable number of bars (default 4 bars).
6. WHEN a practice session ends, THE Chord_Transition_Trainer SHALL display the session summary including total switches completed, average tempo achieved, and session duration.
7. THE Progress_Tracker SHALL record chord transition practice history including the chord pair, date, switches completed, and maximum tempo achieved, so that the user can view improvement over time.
8. WHEN a user views their transition history for a specific chord pair, THE Progress_Tracker SHALL display a chart showing switches-per-minute or max tempo over time.

### Requirement 17: Reading Chord Diagrams Tutorial

**User Story:** As an absolute beginner guitarist, I want an interactive tutorial that teaches me how to read chord diagrams, tablature notation, and the fretboard layout, so that I can understand instructional materials before attempting to play.

#### Acceptance Criteria

1. WHEN a new user accesses the app for the first time, THE Onboarding_Tutorial SHALL offer an optional interactive tutorial on reading chord diagrams, tab notation, and fretboard orientation.
2. THE Onboarding_Tutorial SHALL explain chord diagram elements in a step-by-step interactive walkthrough: vertical lines represent strings, horizontal lines represent frets, dots represent finger placements, X means "do not play this string," and O means "play this string open."
3. THE Onboarding_Tutorial SHALL include an interactive exercise where the user identifies finger positions on a chord diagram and receives immediate feedback on whether the identification is correct.
4. THE Onboarding_Tutorial SHALL explain basic tablature notation: six lines represent six strings (low E at bottom, high E at top), numbers indicate fret positions, and 0 means open string.
5. THE Onboarding_Tutorial SHALL include a fretboard orientation section explaining string names (E A D G B E), fret numbering, and the relationship between the physical guitar and the on-screen diagram.
6. THE Onboarding_Tutorial SHALL allow the user to skip the tutorial at any point and access the tutorial again later from the app settings or help menu.
7. WHEN the user completes the tutorial, THE Onboarding_Tutorial SHALL mark the tutorial as completed in the user's profile and provide a link to proceed to the Learning Path (Requirement 14).
8. THE Onboarding_Tutorial SHALL use the same chord diagram visual style and color-coding scheme used throughout the rest of the application, so that the tutorial directly prepares the user for the actual interface.
