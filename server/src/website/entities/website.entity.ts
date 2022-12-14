import { General, Metadata, Section } from '@reactive-website/schema';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

import { User } from '@/users/entities/user.entity';

@Entity()
@Unique(['user', 'slug'])
export class Website {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  shortId: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  image?: string;

  @ManyToOne(() => User, (user) => user.websites, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'jsonb', default: {} })
  general: General;

  @Column({ type: 'jsonb', default: {} })
  sections: Partial<Record<string, Section>>;

  @Column({ type: 'jsonb', default: {} })
  metadata: Metadata;

  @Column({ default: false })
  public: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<Website>) {
    Object.assign(this, partial);
  }
}
