using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentsApi.Migrations;

public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "student_projects",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                AuthorSub = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                AuthorName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                Tagline = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                Description = table.Column<string>(type: "text", nullable: false),
                Features = table.Column<string>(type: "jsonb", nullable: false),
                TechStack = table.Column<string>(type: "jsonb", nullable: false),
                GithubUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                LiveUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                RejectionReason = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                ApprovedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                ApprovedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_student_projects", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "student_project_media",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                Type = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                Url = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                StorageKey = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                SortOrder = table.Column<int>(type: "integer", nullable: false),
                CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_student_project_media", x => x.Id);
                table.ForeignKey(
                    name: "FK_student_project_media_student_projects_ProjectId",
                    column: x => x.ProjectId,
                    principalTable: "student_projects",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_student_project_media_ProjectId",
            table: "student_project_media",
            column: "ProjectId");

        migrationBuilder.CreateIndex(
            name: "IX_student_projects_AuthorSub",
            table: "student_projects",
            column: "AuthorSub");

        migrationBuilder.CreateIndex(
            name: "IX_student_projects_Status",
            table: "student_projects",
            column: "Status");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "student_project_media");
        migrationBuilder.DropTable(name: "student_projects");
    }
}
