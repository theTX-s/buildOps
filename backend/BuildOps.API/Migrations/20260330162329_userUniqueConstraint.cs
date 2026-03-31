using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BuildOps.API.Migrations
{
    /// <inheritdoc />
    public partial class userUniqueConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "email_id",
                table: "users",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateIndex(
                name: "ix_users_email_id",
                table: "users",
                column: "email_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_phone_number",
                table: "users",
                column: "phone_number",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_users_email_id",
                table: "users");

            migrationBuilder.DropIndex(
                name: "ix_users_phone_number",
                table: "users");

            migrationBuilder.AlterColumn<string>(
                name: "email_id",
                table: "users",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256);
        }
    }
}
