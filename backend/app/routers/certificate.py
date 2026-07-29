from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.intern_profile import InternProfile
from app.models.project import Project
from app.models.guide_assignment import GuideAssignment

router = APIRouter(prefix="/certificate", tags=["certificate"])


@router.get("/me", response_class=HTMLResponse)
def get_my_certificate(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != "intern":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only interns can access certificates")

    profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")

    # Query project title
    project = db.query(Project).filter(Project.intern_id == profile.id).first()
    project_title = project.title if project else "N/A"

    # Query guide name
    guide_name = "N/A"
    assignment = db.query(GuideAssignment).filter(GuideAssignment.intern_id == profile.id).first()
    if assignment:
        guide_user = db.query(User).filter(User.id == assignment.guide_id).first()
        if guide_user:
            guide_name = guide_user.name

    # Compute dates
    joining = profile.joining_date
    if joining and profile.internship_duration_months:
        end_month = joining.month + profile.internship_duration_months
        end_year = joining.year + (end_month - 1) // 12
        end_month = ((end_month - 1) % 12) + 1
        end_date = joining.replace(year=end_year, month=end_month)
    else:
        end_date = None

    joining_str = joining.strftime("%d %B %Y") if joining else "N/A"
    end_str = end_date.strftime("%d %B %Y") if end_date else "N/A"
    issue_str = date.today().strftime("%d %B %Y")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Certificate of Completion</title>
<style>
  @page {{ margin: 0; }}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    font-family: 'Georgia', 'Times New Roman', serif;
    background: #f5f5f5;
    display: flex;
    justify-content: center;
    padding: 20px;
  }}
  .cert {{
    width: 900px;
    min-height: 640px;
    background: #fff;
    border: 3px solid #1a5276;
    padding: 10px;
    position: relative;
  }}
  .cert-inner {{
    border: 2px solid #FF671F;
    padding: 40px 50px;
    min-height: 616px;
    display: flex;
    flex-direction: column;
  }}
  .header {{
    text-align: center;
    margin-bottom: 10px;
  }}
  .header h2 {{
    color: #1a5276;
    font-size: 16px;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 2px;
  }}
  .header h3 {{
    color: #FF671F;
    font-size: 13px;
    letter-spacing: 1px;
    font-weight: normal;
  }}
  .divider {{
    width: 120px;
    height: 2px;
    background: #FF671F;
    margin: 12px auto;
  }}
  .title {{
    text-align: center;
    font-size: 28px;
    color: #1a5276;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin: 10px 0 20px;
  }}
  .body-text {{
    text-align: center;
    font-size: 15px;
    color: #333;
    line-height: 1.8;
    margin-bottom: 10px;
  }}
  .body-text .name {{
    font-size: 22px;
    font-weight: bold;
    color: #1a5276;
    border-bottom: 2px solid #FF671F;
    padding-bottom: 2px;
    display: inline-block;
    margin: 4px 0;
  }}
  .body-text .project {{
    font-style: italic;
    font-weight: 600;
    color: #333;
  }}
  .details-table {{
    margin: 16px auto;
    font-size: 14px;
    color: #444;
    border-collapse: collapse;
  }}
  .details-table td {{
    padding: 4px 12px;
  }}
  .details-table td:first-child {{
    font-weight: 600;
    text-align: right;
    color: #1a5276;
  }}
  .signatures {{
    display: flex;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 30px;
  }}
  .sig-block {{
    text-align: center;
    width: 200px;
  }}
  .sig-line {{
    border-top: 1px solid #333;
    margin-bottom: 4px;
    margin-top: 50px;
  }}
  .sig-block .sig-title {{
    font-size: 12px;
    color: #555;
  }}
  .issue-date {{
    text-align: center;
    font-size: 12px;
    color: #888;
    margin-top: 16px;
  }}
  @media print {{
    body {{ background: #fff; padding: 0; }}
    .cert {{ border: none; box-shadow: none; }}
  }}
</style>
</head>
<body>
<div class="cert">
  <div class="cert-inner">
    <div class="header">
      <h2>Indian Space Research Organisation</h2>
      <h3>Satish Dhawan Space Centre SHAR, Sriharikota</h3>
    </div>
    <div class="divider"></div>
    <div class="title">Certificate of Completion</div>
    <div class="body-text">
      This is to certify that<br/>
      <span class="name">{user.name}</span><br/>
      from <strong>{profile.department or 'N/A'}</strong> department,
      <strong>{profile.college or 'N/A'}</strong>,<br/>
      has successfully completed the internship programme<br/>
      from <strong>{joining_str}</strong> to <strong>{end_str}</strong><br/>
      on the project titled<br/>
      <span class="project">&ldquo;{project_title}&rdquo;</span><br/>
      under the guidance of <strong>{guide_name}</strong>.
    </div>
    <table class="details-table">
      <tr><td>College:</td><td>{profile.college or 'N/A'}</td></tr>
      <tr><td>Department:</td><td>{profile.department or 'N/A'}</td></tr>
      <tr><td>Duration:</td><td>{joining_str} &mdash; {end_str}</td></tr>
    </table>
    <div class="signatures">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-title">Guide</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-title">Head of Division</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-title">Director, SDSC SHAR</div>
      </div>
    </div>
    <div class="issue-date">Date of Issue: {issue_str}</div>
  </div>
</div>
</body>
</html>"""
    return HTMLResponse(content=html)
