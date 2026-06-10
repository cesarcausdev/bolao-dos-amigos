using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bolao.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizerAndValorToBolao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OrganizerId",
                table: "Boloes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ValorBolao",
                table: "Boloes",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_Boloes_OrganizerId",
                table: "Boloes",
                column: "OrganizerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Boloes_Users_OrganizerId",
                table: "Boloes",
                column: "OrganizerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Boloes_Users_OrganizerId",
                table: "Boloes");

            migrationBuilder.DropIndex(
                name: "IX_Boloes_OrganizerId",
                table: "Boloes");

            migrationBuilder.DropColumn(
                name: "OrganizerId",
                table: "Boloes");

            migrationBuilder.DropColumn(
                name: "ValorBolao",
                table: "Boloes");
        }
    }
}
