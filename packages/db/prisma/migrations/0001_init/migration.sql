-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('Prueba', 'Activa', 'Suspendida');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('Borrador', 'Inscripcion', 'En_Curso', 'Finalizado');

-- CreateEnum
CREATE TYPE "TournamentBranch" AS ENUM ('Masculino', 'Femenino', 'Mixto');

-- CreateEnum
CREATE TYPE "TournamentCategory" AS ENUM ('Benjamin', 'Alevin', 'Infantil', 'Cadete', 'Juvenil', 'Sub20', 'Sub23', 'Aficionado', 'TerceraDivision', 'SegundaDivision', 'PrimeraDivision', 'Libre', 'Veteranos');

-- CreateEnum
CREATE TYPE "TieBreaker" AS ENUM ('Diferencia_Goles', 'Goles_Favor', 'Duelo_Directo', 'Fair_Play');

-- CreateEnum
CREATE TYPE "PlayerPosition" AS ENUM ('Portero', 'Defensa_Central', 'Lateral_Derecho', 'Lateral_Izquierdo', 'Mediocentro_Defensivo', 'Mediocentro', 'Mediocampista_Derecho', 'Mediocampista_Izquierdo', 'Mediocentro_Ofensivo', 'Extremo_Derecho', 'Extremo_Izquierdo', 'Delantero_Centro', 'Universal');

-- CreateEnum
CREATE TYPE "SquadStatus" AS ENUM ('Activo', 'Baja_Lesion', 'Baja_Definitiva');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('Programado', 'En_Curso', 'Finalizado', 'Suspendido', 'Cancelado', 'Walkover');

-- CreateEnum
CREATE TYPE "MatchPhase" AS ENUM ('Regular', 'Liguilla', 'Eliminatoria', 'Final');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('Amarilla', 'Doble_Amarilla', 'Roja_Directa');

-- CreateEnum
CREATE TYPE "SuspensionStatus" AS ENUM ('Activa', 'Cumplida', 'Pagada_Redimida', 'Anulada_Apelacion');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_url" TEXT,
    "contact_phone" TEXT,
    "contact_email" TEXT,
    "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'Prueba',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID,
    "name" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "tenant_users" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_user_roles" (
    "tenant_user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,

    CONSTRAINT "tenant_user_roles_pkey" PRIMARY KEY ("tenant_user_id","role_id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" "TournamentCategory",
    "branch" "TournamentBranch",
    "status" "TournamentStatus" NOT NULL DEFAULT 'Borrador',
    "max_teams" INTEGER NOT NULL,
    "logo_url" TEXT,
    "contact_phone" TEXT,
    "contact_email" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "admin_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_rules" (
    "tournament_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "players_per_team" INTEGER NOT NULL,
    "match_duration_minutes" INTEGER NOT NULL,
    "extra_time_minutes" INTEGER NOT NULL DEFAULT 0,
    "penalty_shootout_count" INTEGER NOT NULL DEFAULT 5,
    "double_round_robin" BOOLEAN NOT NULL DEFAULT true,
    "points_win" INTEGER NOT NULL DEFAULT 3,
    "points_draw" INTEGER NOT NULL DEFAULT 1,
    "points_loss" INTEGER NOT NULL DEFAULT 0,
    "walkover_goals" INTEGER NOT NULL DEFAULT 3,
    "min_squad_size" INTEGER NOT NULL DEFAULT 7,
    "max_squad_size" INTEGER NOT NULL DEFAULT 20,
    "tie_breakers" "TieBreaker"[] DEFAULT ARRAY['Diferencia_Goles', 'Goles_Favor', 'Duelo_Directo']::"TieBreaker"[],

    CONSTRAINT "tournament_rules_pkey" PRIMARY KEY ("tournament_id")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pitches" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "venue_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "has_lighting" BOOLEAN NOT NULL DEFAULT false,
    "usage_cost" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pitches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "primary_color" TEXT NOT NULL,
    "representative_id" UUID,
    "representative_name" TEXT,
    "representative_phones" TEXT[],
    "representative_email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_teams" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "tournament_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "registration_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "document_number" TEXT,
    "birth_date" DATE,
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squads" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "tournament_team_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "squad_number" INTEGER NOT NULL,
    "position" "PlayerPosition" NOT NULL,
    "status" "SquadStatus" NOT NULL DEFAULT 'Activo',
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unregistered_at" TIMESTAMP(3),

    CONSTRAINT "squads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_rounds" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "tournament_id" UUID NOT NULL,
    "round_number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phase" "MatchPhase" NOT NULL DEFAULT 'Regular',
    "start_date" DATE,
    "end_date" DATE,

    CONSTRAINT "tournament_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "tournament_id" UUID NOT NULL,
    "round_id" UUID NOT NULL,
    "home_team_id" UUID NOT NULL,
    "away_team_id" UUID NOT NULL,
    "pitch_id" UUID,
    "scheduled_at" TIMESTAMP(3),
    "status" "MatchStatus" NOT NULL DEFAULT 'Programado',
    "home_score" INTEGER NOT NULL DEFAULT 0,
    "away_score" INTEGER NOT NULL DEFAULT 0,
    "home_penalty_score" INTEGER,
    "away_penalty_score" INTEGER,
    "winner_team_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_goals" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "squad_id" UUID NOT NULL,
    "assist_squad_id" UUID,
    "minute" INTEGER,
    "is_own_goal" BOOLEAN NOT NULL DEFAULT false,
    "is_penalty" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "match_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_cards" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "squad_id" UUID NOT NULL,
    "card_type" "CardType" NOT NULL,
    "minute" INTEGER,
    "reason" TEXT,

    CONSTRAINT "match_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_sanction_rules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "tournament_id" UUID NOT NULL,
    "card_type" "CardType" NOT NULL,
    "accumulation_threshold" INTEGER,
    "matches_suspended" INTEGER NOT NULL DEFAULT 1,
    "redemption_fine_amount" DECIMAL(10,2),

    CONSTRAINT "tournament_sanction_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_suspensions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "squad_id" UUID NOT NULL,
    "match_card_id" UUID,
    "matches_suspended" INTEGER NOT NULL,
    "status" "SuspensionStatus" NOT NULL DEFAULT 'Activa',
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "player_suspensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suspension_served" (
    "suspension_id" UUID NOT NULL,
    "match_id" UUID NOT NULL,

    CONSTRAINT "suspension_served_pkey" PRIMARY KEY ("suspension_id","match_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "roles_tenant_id_name_key" ON "roles"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_users_tenant_id_user_id_key" ON "tenant_users"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "tournaments_tenant_id_status_idx" ON "tournaments"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "tournaments_tenant_id_slug_key" ON "tournaments"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "venues_tenant_id_idx" ON "venues"("tenant_id");

-- CreateIndex
CREATE INDEX "pitches_tenant_id_idx" ON "pitches"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_tenant_id_name_key" ON "teams"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "tournament_teams_tenant_id_idx" ON "tournament_teams"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_teams_tournament_id_team_id_key" ON "tournament_teams"("tournament_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "players_tenant_id_document_number_key" ON "players"("tenant_id", "document_number");

-- CreateIndex
CREATE INDEX "squads_tenant_id_idx" ON "squads"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "squads_tournament_team_id_player_id_key" ON "squads"("tournament_team_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "squads_tournament_team_id_squad_number_key" ON "squads"("tournament_team_id", "squad_number");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_rounds_tournament_id_phase_round_number_key" ON "tournament_rounds"("tournament_id", "phase", "round_number");

-- CreateIndex
CREATE INDEX "matches_pitch_id_scheduled_at_idx" ON "matches"("pitch_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "matches_tournament_id_status_idx" ON "matches"("tournament_id", "status");

-- CreateIndex
CREATE INDEX "match_goals_match_id_idx" ON "match_goals"("match_id");

-- CreateIndex
CREATE INDEX "match_cards_match_id_idx" ON "match_cards"("match_id");

-- CreateIndex
CREATE INDEX "match_cards_squad_id_idx" ON "match_cards"("squad_id");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_sanction_rules_tournament_id_card_type_key" ON "tournament_sanction_rules"("tournament_id", "card_type");

-- CreateIndex
CREATE INDEX "player_suspensions_squad_id_status_idx" ON "player_suspensions"("squad_id", "status");

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_user_roles" ADD CONSTRAINT "tenant_user_roles_tenant_user_id_fkey" FOREIGN KEY ("tenant_user_id") REFERENCES "tenant_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_user_roles" ADD CONSTRAINT "tenant_user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_rules" ADD CONSTRAINT "tournament_rules_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venues" ADD CONSTRAINT "venues_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pitches" ADD CONSTRAINT "pitches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pitches" ADD CONSTRAINT "pitches_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_representative_id_fkey" FOREIGN KEY ("representative_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_teams" ADD CONSTRAINT "tournament_teams_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_teams" ADD CONSTRAINT "tournament_teams_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_teams" ADD CONSTRAINT "tournament_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squads" ADD CONSTRAINT "squads_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squads" ADD CONSTRAINT "squads_tournament_team_id_fkey" FOREIGN KEY ("tournament_team_id") REFERENCES "tournament_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squads" ADD CONSTRAINT "squads_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_rounds" ADD CONSTRAINT "tournament_rounds_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_rounds" ADD CONSTRAINT "tournament_rounds_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "tournament_rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "tournament_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "tournament_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_pitch_id_fkey" FOREIGN KEY ("pitch_id") REFERENCES "pitches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_goals" ADD CONSTRAINT "match_goals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_goals" ADD CONSTRAINT "match_goals_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_goals" ADD CONSTRAINT "match_goals_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "squads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_goals" ADD CONSTRAINT "match_goals_assist_squad_id_fkey" FOREIGN KEY ("assist_squad_id") REFERENCES "squads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_cards" ADD CONSTRAINT "match_cards_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_cards" ADD CONSTRAINT "match_cards_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_cards" ADD CONSTRAINT "match_cards_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "squads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_sanction_rules" ADD CONSTRAINT "tournament_sanction_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_sanction_rules" ADD CONSTRAINT "tournament_sanction_rules_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_suspensions" ADD CONSTRAINT "player_suspensions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_suspensions" ADD CONSTRAINT "player_suspensions_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "squads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_suspensions" ADD CONSTRAINT "player_suspensions_match_card_id_fkey" FOREIGN KEY ("match_card_id") REFERENCES "match_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suspension_served" ADD CONSTRAINT "suspension_served_suspension_id_fkey" FOREIGN KEY ("suspension_id") REFERENCES "player_suspensions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suspension_served" ADD CONSTRAINT "suspension_served_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Agregado a mano: Prisma no soporta CHECK constraints en el schema.
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_away_distinct" CHECK ("home_team_id" <> "away_team_id");
ALTER TABLE "tournament_rules" ADD CONSTRAINT "tournament_rules_squad_size" CHECK ("min_squad_size" <= "max_squad_size");
