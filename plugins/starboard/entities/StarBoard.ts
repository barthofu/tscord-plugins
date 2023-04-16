import { Entity, PrimaryKey, Property, EntityRepositoryType, OneToMany, IntegerType } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/sqlite'

import { CustomBaseEntity } from '@entities'

// ===========================================
// ================= Entity ==================
// ===========================================

@Entity({ customRepository: () => StarBoardRepository })
export class StarBoard extends CustomBaseEntity {

    [EntityRepositoryType]?: StarBoardRepository

    @PrimaryKey({ autoincrement: false })
    guildId!: string

    @Property()
    channelId!: string

    @Property({default: '⭐'})
    emoji!: string

    @Property({ type: IntegerType })
    minStar: number = 3
}

// ===========================================
// =========== Custom Repository =============
// ===========================================

export class StarBoardRepository extends EntityRepository<StarBoard> { 

}