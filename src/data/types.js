/**
 * 공용 도메인 타입 정의 (JSDoc)
 * 백엔드 연동 시 이 파일의 구조를 그대로 API 응답/요청 타입으로 사용한다.
 *
 * @typedef {'student' | 'teacher' | 'admin'} Role
 *
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {Role} role
 * @property {string=} studentNo     학번 (학생만)
 * @property {boolean=} canPostJobs  취업 정보 작성 권한 (반 대표 학생에게만 true)
 *
 * @typedef {Object} Schedule
 * @property {string} id
 * @property {string} title
 * @property {string} date           ISO (YYYY-MM-DD)
 * @property {string=} description
 * @property {boolean} important
 * @property {string} createdBy      userId
 *
 * @typedef {'draft' | 'private' | 'teacher-only'} JobVisibility
 * @typedef {Object} JobPost
 * @property {string} id
 * @property {string} title
 * @property {string} authorId
 * @property {string} authorName
 * @property {string} createdAt       ISO datetime
 * @property {string} content
 * @property {string=} company
 * @property {JobVisibility} visibility  기본 'teacher-only'
 *
 * @typedef {Object} MealSection
 * @property {string[]} dishes
 * @property {number=} kcal
 *
 * @typedef {Object} MealMenu
 * @property {string} date            ISO (YYYY-MM-DD)
 * @property {MealSection=} breakfast  조식
 * @property {MealSection=} lunch      중식
 * @property {MealSection=} dinner     석식
 *
 * @typedef {Object} PortfolioFile
 * @property {string} name           파일명 (예: "이력서.pdf")
 * @property {number} size           바이트
 * @property {string} dataUrl        base64 data URL (프론트 전용, 추후 업로드 URL로 교체)
 * @property {string} uploadedAt     ISO datetime
 *
 * @typedef {Object} Portfolio
 * @property {string} id
 * @property {string} ownerId
 * @property {string} ownerName
 * @property {string} title
 * @property {string=} summary
 * @property {string=} link
 * @property {string=} legacyContent  이전 방식(텍스트만) 저장분
 * @property {PortfolioFile=} resume      이력서 PDF
 * @property {PortfolioFile=} portfolio   포트폴리오 PDF
 * @property {string} updatedAt       ISO datetime
 *
 * @typedef {Object} Rule
 * @property {string} id
 * @property {number} order
 * @property {string} text
 *
 * @typedef {'open' | 'resolved' | 'waived'} PenaltyStatus
 * @typedef {Object} Penalty
 * @property {string} id
 * @property {string} studentId
 * @property {string} studentName
 * @property {string} reason
 * @property {string} date            ISO (YYYY-MM-DD)
 * @property {PenaltyStatus} status
 *
 * @typedef {Object} Notice
 * @property {string} id
 * @property {string} title
 * @property {string} body
 * @property {string} createdAt
 * @property {string} authorName
 */
export {}
