--Make sure to name the table with {modulename}:{tablename}, to ensure no conflicts.
CREATE TABLE IF NOT EXISTS hunters_profiles (
    --Snowflakes (discord id's) are 18 characters/digits long.
    userId VARCHAR(18) PRIMARY KEY,
    hunterName VARCHAR(100),
    palicoName VARCHAR(100),
    /*
    0   - NONE
    1   - GREAT SWORD
    2   - LONG SWORD
    3   - SWORD AND SHIELD
    4   - DUEL BLADES
    5   - HAMMER
    6   - HUNTING HORN
    7   - LANCE
    8   - GUNLANCE
    9   - SWITCH AXE
    10  - CHARGE BLADE
    11  - INSECT GLAIVE
    12  - LIGHT BOWGUN
    13  - HEAVY BOWGUN
    14  - BOW
    */
    mainWeapon VARCHAR(18),
    HR INT(),
    MR INT(),
    /*
        1 x Forest +
        2 x Wildspire +
        4 x Coral + 
        8 x Rotted + 
        16 x Volcanic + 
        32 x Tundra
    */
    maxedGuidedLands INT() DEFAULT 0 CHECK(maxedGuidedLands < 64)
);