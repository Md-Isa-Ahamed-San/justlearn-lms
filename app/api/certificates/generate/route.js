import { db } from "@/lib/prisma";
import { getLoggedInUser } from "@/lib/loggedin-user";
import { NextResponse } from "next/server";
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 0,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f8f5ff",
  },
  borderOuter: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 3,
    borderColor: "#7c3aed",
    borderStyle: "solid",
  },
  borderInner: {
    position: "absolute",
    top: 26,
    left: 26,
    right: 26,
    bottom: 26,
    borderWidth: 1,
    borderColor: "#c4b5fd",
    borderStyle: "solid",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 60,
    paddingVertical: 50,
  },
  header: {
    fontSize: 12,
    color: "#7c3aed",
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 8,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 40,
    color: "#1e1b4b",
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 30,
    fontFamily: "Helvetica",
  },
  divider: {
    width: 80,
    height: 2,
    backgroundColor: "#7c3aed",
    marginBottom: 28,
  },
  presentedTo: {
    fontSize: 12,
    color: "#9ca3af",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
    fontFamily: "Helvetica",
  },
  studentName: {
    fontSize: 32,
    color: "#1e1b4b",
    marginBottom: 20,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  body: {
    fontSize: 13,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 1.6,
    marginBottom: 6,
    fontFamily: "Helvetica",
  },
  courseName: {
    fontSize: 18,
    color: "#7c3aed",
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 30,
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerLeft: {
    alignItems: "center",
    flex: 1,
  },
  footerRight: {
    alignItems: "center",
    flex: 1,
  },
  signatureLine: {
    width: 120,
    height: 1,
    backgroundColor: "#6b7280",
    marginBottom: 6,
  },
  footerLabel: {
    fontSize: 10,
    color: "#9ca3af",
    fontFamily: "Helvetica",
  },
  footerValue: {
    fontSize: 11,
    color: "#374151",
    fontFamily: "Helvetica-Bold",
  },
  orgName: {
    fontSize: 14,
    color: "#7c3aed",
    fontFamily: "Helvetica-Bold",
    marginBottom: 20,
    letterSpacing: 1,
  },
});

function CertificatePDF({ studentName, courseName, instructorName, completedAt, courseId }) {
  const dateStr = new Date(completedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document title={`Certificate - ${courseName}`} author="JustLearn LMS">
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.background} />
        <View style={styles.borderOuter} />
        <View style={styles.borderInner} />

        <View style={styles.content}>
          <Text style={styles.orgName}>JustLearn LMS</Text>
          <Text style={styles.header}>Certificate of Completion</Text>
          <View style={styles.divider} />

          <Text style={styles.presentedTo}>This certificate is proudly presented to</Text>
          <Text style={styles.studentName}>{studentName}</Text>

          <Text style={styles.body}>
            for successfully completing the course
          </Text>
          <Text style={styles.courseName}>{courseName}</Text>

          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <View style={styles.signatureLine} />
              <Text style={styles.footerValue}>{instructorName || "JustLearn Team"}</Text>
              <Text style={styles.footerLabel}>Instructor</Text>
            </View>
            <View style={styles.footerRight}>
              <View style={styles.signatureLine} />
              <Text style={styles.footerValue}>{dateStr}</Text>
              <Text style={styles.footerLabel}>Date of Completion</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const certificateId = searchParams.get("id");
    const courseId = searchParams.get("courseId");

    const user = await getLoggedInUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find certificate
    let certificate;
    if (certificateId) {
      certificate = await db.certificate.findUnique({
        where: { id: certificateId },
        include: {
          course: {
            include: {
              user: true, // instructor
            },
          },
          user: true,
        },
      });
    } else if (courseId) {
      certificate = await db.certificate.findFirst({
        where: { userId: user.id, courseId },
        include: {
          course: {
            include: {
              user: true,
            },
          },
          user: true,
        },
      });
    }

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // Only the certificate owner can download it
    if (certificate.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pdfBuffer = await renderToBuffer(
      <CertificatePDF
        studentName={certificate.user.name}
        courseName={certificate.course.title}
        instructorName={certificate.course.user?.name}
        completedAt={certificate.createdAt}
        courseId={certificate.courseId}
      />
    );

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${certificate.course.title.replace(/\s+/g, "-")}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Certificate generation error:", error);
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 });
  }
}
